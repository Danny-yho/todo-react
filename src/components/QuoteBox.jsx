import { useCallback, useEffect, useRef, useState } from 'react';

function QuoteBox() {
  const [quote, setQuote] = useState({ content: 'Loading...', author: '' });
  const [isLoading, setIsLoading] = useState(true);
  const controllerRef = useRef(null);

  const fetchQuote = useCallback(async (signal) => {
    try {
      const response = await fetch('https://dummyjson.com/quotes/random', {
        signal,
      });
      if (!response.ok) {
        throw new Error(`Quote request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (typeof data.quote !== 'string' || typeof data.author !== 'string') {
        throw new Error('Quote response was not in the expected format');
      }

      if (!signal?.aborted) {
        setQuote({ content: data.quote, author: data.author });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;

      console.error('Failed to load daily quote:', error);
      setQuote({ content: "Today's quote could not be loaded.", author: '' });
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    void Promise.resolve().then(() => fetchQuote(controller.signal));
    const intervalId = setInterval(() => {
      void fetchQuote(controller.signal);
    }, 60000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [fetchQuote]);

  function handleNewQuote() {
    setIsLoading(true);
    void fetchQuote(controllerRef.current?.signal);
  }

  return (
    <div className="alert alert-info text-center mb-4" role="status">
      <p className="mb-1">“{quote.content}”</p>
      {quote.author && <small>— {quote.author}</small>}
      <div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={handleNewQuote}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'New Quote'}
        </button>
      </div>
    </div>
  );
}

export default QuoteBox;
