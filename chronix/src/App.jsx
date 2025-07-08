import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(["visitCount"], (result) => {
      const value = result.visitCount || 0;
      setCount(value);
    });
  }, []);

  const increment = () => {
    const newCount = count + 1;
    chrome.storage.local.set({ visitCount: newCount });
    setCount(newCount);
  };

  return (
    <div className="p-4 w-64">
      <h1 className="text-xl font-bold mb-2">Welcome!</h1>
      <p>You clicked {count} times</p>
      <button
        onClick={increment}
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Click Me
      </button>
    </div>
  );
}

export default App;
