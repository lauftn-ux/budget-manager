import React, { useContext, useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import { AppContext } from '../context/AppContext';

const BudgetCharts = () => {
  const { transactions, categories, calculateTotals } = useContext(AppContext);
  const [timeRange, setTimeRange] = useState('month'); // 'month', 'quarter', 'year'
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  // Formater les montants en devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  useEffect(() => {
    if (transactions.length > 0) {
      // Filtrer les transactions selon la période sélectionnée
      const now = new Date();
      const filteredTransactions = filterTransactionsByTimeRange(transactions, timeRange, now);
      
      // Calculer les données par catégorie
      const catData = calculateCategoryData(filteredTransactions, categories);
      setCategoryData(catData);
      
      // Calculer les données mensuelles
      const monthlyTrends = calculateMonthlyData(transactions, 6); // 6 derniers mois
      setMonthlyData(monthlyTrends);
      
      // Calculer les données de comparaison budget vs dépenses
      const compData = calculateComparisonData(filteredTransactions, categories);
      setComparisonData(compData);
    }
  }, [transactions, categories, timeRange]);

  // Filtrer les transactions selon la période
  const filterTransactionsByTimeRange = (transactions, range, now) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (range === 'month') {
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      } else if (range === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
        return transactionQuarter === currentQuarter && 
               transactionDate.getFullYear() === now.getFullYear();
      } else if (range === 'year') {
        return transactionDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  // Calculer les données par catégorie pour le graphique en camembert
  const calculateCategoryData = (filteredTransactions, categories) => {
    const catTotals = {};
    
    // Initialiser les totaux pour chaque catégorie
    categories.forEach(category => {
      catTotals[category.id] = 0;
    });
    
    // Calculer les totaux de dépenses par catégorie
    filteredTransactions.forEach(transaction => {
      if (transaction.amount < 0) { // Seulement les dépenses
        const categoryId = transaction.category;
        catTotals[categoryId] = (catTotals[categoryId] || 0) + Math.abs(transaction.amount);
      }
    });
    
    // Convertir en format pour le graphique
    const result = Object.entries(catTotals)
      .filter(([_, total]) => total > 0) // Ne garder que les catégories avec des dépenses
      .map(([categoryId, total]) => {
        const category = categories.find(cat => cat.id === parseInt(categoryId)) || { name: 'Inconnue', color: '#9e9e9e' };
        return {
          name: category.name,
          value: total,
          color: category.color
        };
      })
      .sort((a, b) => b.value - a.value); // Trier par valeur décroissante
    
    return result;
  };

  // Calculer les données mensuelles pour le graphique en barres
  const calculateMonthlyData = (allTransactions, monthCount) => {
    const result = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Données pour les derniers mois
    for (let i = 0; i < monthCount; i++) {
      const monthIndex = (currentMonth - i + 12) % 12; // Gère le passage à l'année précédente
      const year = currentYear - Math.floor((i - currentMonth) / 12);
      const monthDate = new Date(year, monthIndex, 1);
      const monthName = monthDate.toLocaleString('fr-FR', { month: 'short' });
      
      // Filtrer les transactions pour ce mois
      const monthlyTransactions = allTransactions.filter(transaction => {
        const transDate = new Date(transaction.date);
        return transDate.getMonth() === monthIndex && transDate.getFullYear() === year;
      });
      
      // Calculer les revenus et dépenses
      const income = monthlyTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthlyTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      result.unshift({ // Ajouter au début pour avoir l'ordre chronologique
        name: `${monthName} ${year}`,
        revenus: income,
        dépenses: expenses
      });
    }
    
    return result;
  };

  // Calculer les données de comparaison budget vs dépenses
  const calculateComparisonData = (filteredTransactions, categories) => {
    // Cette fonction nécessiterait d'avoir accès aux budgets définis
    // Pour simplifier, nous utilisons des données statiques pour l'instant
    return [
      { name: 'Alimentation', budget: 500, dépenses: 423 },
      { name: 'Logement', budget: 1200, dépenses: 1150 },
      { name: 'Transport', budget: 300, dépenses: 280 },
      { name: 'Loisirs', budget: 200, dépenses: 310 },
      { name: 'Santé', budget: 100, dépenses: 45 }
    ];
  };

  return (
    <Box>
      {/* Filtres de période */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined">
          <Button 
            onClick={() => setTimeRange('month')}
            variant={timeRange === 'month' ? 'contained' : 'outlined'}
          >
            Mensuel
          </Button>
          <Button 
            onClick={() => setTimeRange('quarter')}
            variant={timeRange === 'quarter' ? 'contained' : 'outlined'}
          >
            Trimestriel
          </Button>
          <Button 
            onClick={() => setTimeRange('year')}
            variant={timeRange === 'year' ? 'contained' : 'outlined'}
          >
            Annuel
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Graphique en camembert des dépenses par catégorie */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Répartition des dépenses par catégorie
            </Typography>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune donnée disponible
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Graphique en barres de l'évolution mensuelle */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Évolution mensuelle
            </Typography>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenus" name="Revenus" fill="#4caf50" />
                  <Bar dataKey="dépenses" name="Dépenses" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune donnée disponible
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Graphique de comparaison budget vs dépenses */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Dépenses réelles par catégorie
            </Typography>
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="dépenses" name="Dépenses réelles" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune donnée disponible
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetCharts;