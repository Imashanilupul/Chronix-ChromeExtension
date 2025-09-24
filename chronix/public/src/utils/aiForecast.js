import * as tf from '@tensorflow/tfjs';

// Get daily totals from Chrome storage
async function getDailyTotals() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usage'], (result) => {
      const usage = result.usage || {};
      const daily = new Map();
      
      // Aggregate all domains by date
      for (const domain of Object.keys(usage)) {
        const dates = usage[domain] || {};
        for (const [date, seconds] of Object.entries(dates)) {
          daily.set(date, (daily.get(date) || 0) + (seconds || 0));
        }
      }
      
      // Convert to sorted array
      const dailyArray = Array.from(daily.entries())
        .map(([date, seconds]) => ({
          date,
          minutes: Math.round((seconds || 0) / 60)
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      resolve(dailyArray);
    });
  });
}

// Normalize data to 0-1 range
function normalizeData(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  return {
    normalized: values.map(v => (v - min) / range),
    min,
    max,
    range
  };
}

// Denormalize predictions back to original scale
function denormalize(normalizedValue, min, range) {
  return normalizedValue * range + min;
}

// Create sequences for LSTM training
function createSequences(data, lookback) {
  const X = [];
  const y = [];
  
  for (let i = lookback; i < data.length; i++) {
    X.push(data.slice(i - lookback, i));
    y.push(data[i]);
  }
  
  return { X, y };
}

// Build and train LSTM model
async function buildLSTMModel(X, y, lookback) {
  // Convert to tensors
  const xs = tf.tensor3d(X.map(seq => seq.map(v => [v])));
  const ys = tf.tensor2d(y, [y.length, 1]);
  
  // Build LSTM model
  const model = tf.sequential({
    layers: [
      tf.layers.lstm({
        units: 32,
        returnSequences: true,
        inputShape: [lookback, 1],
        dropout: 0.1,
        recurrentDropout: 0.1
      }),
      tf.layers.lstm({
        units: 16,
        returnSequences: false,
        dropout: 0.1,
        recurrentDropout: 0.1
      }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 1, activation: 'linear' })
    ]
  });
  
  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });
  
  // Train model
  const history = await model.fit(xs, ys, {
    epochs: 100,
    batchSize: Math.min(8, Math.floor(X.length / 2)),
    validationSplit: 0.2,
    shuffle: true,
    verbose: 0,
    callbacks: [
      tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 15,
        restoreBestWeights: true
      })
    ]
  });
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  
  return {
    model,
    finalLoss: history.history.loss[history.history.loss.length - 1],
    finalValLoss: history.history.val_loss ? history.history.val_loss[history.history.val_loss.length - 1] : null
  };
}

// Calculate prediction confidence based on recent prediction errors
function calculateConfidence(actualValues, predictions, normalizationParams) {
  if (actualValues.length < 3) return 0.7; // Default confidence
  
  const errors = actualValues.map((actual, i) => {
    if (i >= predictions.length) return 0;
    const pred = denormalize(predictions[i], normalizationParams.min, normalizationParams.range);
    return Math.abs(actual - pred);
  });
  
  const mape = errors.reduce((sum, err, i) => {
    return sum + (actualValues[i] > 0 ? err / actualValues[i] : 0);
  }, 0) / errors.length;
  
  // Convert MAPE to confidence (lower error = higher confidence)
  return Math.max(0.3, Math.min(0.95, 1 - mape));
}

// Main forecasting function
export async function forecastNextDayLSTM(lookback = 14) {
  try {
    const dailyData = await getDailyTotals();
    
    if (dailyData.length < lookback + 5) {
      return {
        success: false,
        error: 'insufficient_data',
        message: `Need at least ${lookback + 5} days of data. Currently have ${dailyData.length} days.`,
        dailyData
      };
    }
    
    const values = dailyData.map(d => d.minutes);
    const { normalized, min, max, range } = normalizeData(values);
    
    // Create training sequences
    const { X, y } = createSequences(normalized, lookback);
    
    if (X.length < 5) {
      return {
        success: false,
        error: 'insufficient_sequences',
        message: 'Not enough data sequences for training.',
        dailyData
      };
    }
    
    // Build and train model
    console.log('Training LSTM model...');
    const { model, finalLoss, finalValLoss } = await buildLSTMModel(X, y, lookback);
    
    // Prepare last sequence for prediction
    const lastSequence = normalized.slice(-lookback);
    const inputTensor = tf.tensor3d([lastSequence.map(v => [v])]);
    
    // Make prediction
    const prediction = model.predict(inputTensor);
    const predictionData = await prediction.data();
    const normalizedForecast = predictionData[0];
    
    // Denormalize forecast
    const forecastMinutes = Math.max(0, denormalize(normalizedForecast, min, range));
    
    // Calculate confidence interval
    const confidence = calculateConfidence(values.slice(-5), y.slice(-5), { min, range });
    const errorMargin = Math.sqrt(finalValLoss || finalLoss) * range;
    
    const result = {
      success: true,
      dailyData,
      forecast: {
        minutes: Math.round(forecastMinutes),
        hours: Math.round(forecastMinutes / 60 * 10) / 10,
        confidence: Math.round(confidence * 100),
        confidenceInterval: {
          lower: Math.max(0, Math.round(forecastMinutes - errorMargin)),
          upper: Math.round(forecastMinutes + errorMargin)
        }
      },
      model: {
        lookback,
        trainingSamples: X.length,
        finalLoss: Math.round(finalLoss * 1000) / 1000,
        finalValLoss: finalValLoss ? Math.round(finalValLoss * 1000) / 1000 : null
      },
      nextDate: getNextDate(dailyData[dailyData.length - 1].date)
    };
    
    // Clean up tensors and model
    inputTensor.dispose();
    prediction.dispose();
    model.dispose();
    
    console.log('LSTM forecast completed:', result.forecast);
    return result;
    
  } catch (error) {
    console.error('LSTM forecasting error:', error);
    return {
      success: false,
      error: 'training_failed',
      message: error.message,
      dailyData: await getDailyTotals()
    };
  }
}

// Get next date string
function getNextDate(lastDateStr) {
  const lastDate = new Date(lastDateStr);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate.toISOString().split('T')[0];
}

// Fallback simple forecast for when LSTM fails
export async function forecastSimple() {
  const dailyData = await getDailyTotals();
  
  if (dailyData.length === 0) {
    return {
      success: false,
      error: 'no_data',
      message: 'No usage data available.',
      dailyData: []
    };
  }
  
  // Simple 7-day moving average
  const recentDays = Math.min(7, dailyData.length);
  const recentValues = dailyData.slice(-recentDays).map(d => d.minutes);
  const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  
  return {
    success: true,
    dailyData,
    forecast: {
      minutes: Math.round(average),
      hours: Math.round(average / 60 * 10) / 10,
      confidence: 60,
      confidenceInterval: {
        lower: Math.max(0, Math.round(average * 0.7)),
        upper: Math.round(average * 1.3)
      }
    },
    model: {
      type: 'moving_average',
      lookback: recentDays
    },
    nextDate: getNextDate(dailyData[dailyData.length - 1].date)
  };
}

// Main export - tries LSTM first, falls back to simple
export async function forecastNextDay() {
  console.log('Starting AI forecast...');
  
  // Try LSTM first
  const lstmResult = await forecastNextDayLSTM(14);
  
  if (lstmResult.success) {
    return lstmResult;
  }
  
  console.log('LSTM failed, using simple forecast:', lstmResult.error);
  return await forecastSimple();
}