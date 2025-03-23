import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress } from '@mui/material';

interface ExchangeRateProps {
  currency: string;
}

const ExchangeRate: React.FC<ExchangeRateProps> = ({ currency }) => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'USD') {
        setRate(1);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/USD`
        );
        const data = await response.json();
        if (data.rates[currency]) {
          setRate(data.rates[currency]);
        }
      } catch (err) {
        setError('Could not fetch exchange rate');
        console.error('Exchange rate fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, [currency]);

  if (loading) {
    return <CircularProgress size={16} />;
  }

  if (error) {
    return null;
  }

  if (rate === null || currency === 'USD') {
    return null;
  }

  return (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
      1 USD = {rate.toFixed(2)} {currency}
    </Typography>
  );
};

export default ExchangeRate;