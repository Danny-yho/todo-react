import { useEffect, useState } from 'react';

const quotes = [
  {
    content: 'Wonder is the beginning of wisdom.',
    reference: 'Socrates',
  },
  {
    content:
      'It is not enough to have a good mind; the main thing is to use it well.',
    reference: 'René Descartes',
  },
  {
    content: 'An investment in knowledge pays the best interest.',
    reference: 'Benjamin Franklin',
  },
  {
    content: 'The important thing is not to stop questioning.',
    reference: 'Albert Einstein',
  },
  {
    content:
      'Nothing in life is to be feared; it is only to be understood.',
    reference: 'Marie Curie',
  },
  {
    content: 'The beginning of wisdom is the definition of terms.',
    reference: 'Socrates',
  },
  {
    content:
      'Reading furnishes the mind only with materials of knowledge; thinking makes what we read our own.',
    reference: 'John Locke',
  },
];

function getNextQuote(currentQuote) {
  const currentIndex = quotes.indexOf(currentQuote);
  let nextIndex = Math.floor(Math.random() * quotes.length);

  while (quotes.length > 1 && nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * quotes.length);
  }

  return quotes[nextIndex];
}

function QuoteBox() {
  const [quote, setQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuote((currentQuote) => getNextQuote(currentQuote));
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="alert alert-info text-center mb-4" role="status">
      <p className="mb-1">“{quote.content}”</p>
      <small>— {quote.reference}</small>
      <div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={() => setQuote((currentQuote) => getNextQuote(currentQuote))}
        >
          New Quote
        </button>
      </div>
    </div>
  );
}

export default QuoteBox;
