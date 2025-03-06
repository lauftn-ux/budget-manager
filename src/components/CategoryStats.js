import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AppContext } from '../context/AppContext';

const CategoryStats = () => {
  const { transactions, categories } = useContext(AppContext);
  const [timeRange, setTimeRange] = useState('month'); // 'month', 'quarter', 'year'
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

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
      
      // Calculer les données de tendance
      const trends = calculateTrendData(transactions, categories, timeRange);
      setTrendData(trends);
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

  // Calculer les données par catégorie
  const calculateCategoryData = (filteredTransactions, categories) => {
    const catData = {};
    
    // Initialiser les données pour chaque catégorie
    categories.forEach(category => {
      catData[category.id] = {
        id: category.id,
        name: category.name,
        color: category.color,
        total: 0,
        count: 0,
        average: 0,
        min: Infinity,
        max: -Infinity
      };
    });
    
    // Calculer les statistiques
    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category;
      const amount = Math.abs(transaction.amount);
      
      if (catData[categoryId]) {
        catData[categoryId].total += amount;
        catData[categoryId].count += 1;
        catData[categoryId].min = Math.min(catData[categoryId].min, amount);
        catData[categoryId].max = Math.max(catData[categoryId].max, amount);
      }
    });
    
    // Calculer les moyennes et finaliser les données
    const result = Object.values(catData)
      .map(cat => {
        if (cat.count > 0) {
          cat.average = cat.total / cat.count;
        }
        if (cat.min === Infinity) cat.min = 0;
        if (cat.max === -Infinity) cat.max = 0;
        return cat;
      })
      .filter(cat => cat.count > 0) // Ne garder que les catégories avec des transactions
      .sort((a, b) => b.total - a.total); // Trier par total décroissant
    
    return result;
  };

  // Calculer les données de tendance par mois/trimestre
  const calculateTrendData = (allTransactions, categories, timeRange) => {
    const result = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    if (timeRange === 'month' || timeRange === 'quarter') {
      // Données mensuelles pour les 6 derniers mois
      const monthCount = timeRange === 'month' ? 6 : 12;
      
      for (let i = 0; i < monthCount; i++) {
        const targetMonth = new Date(currentYear, now.getMonth() - i, 1);
        const monthName = targetMonth.toLocaleString('fr-FR', { month: 'short' });
        const yearMonth = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`;
        
        const monthData = {
          name: `${monthName} ${targetMonth.getFullYear()}`,
          period: yearMonth,
        };
        
        // Ajouter les dépenses par catégorie
        categories.forEach(category => {
          const categoryTotal = allTransactions
            .filter(transaction => {
              const transDate = new Date(transaction.date);
              return transaction.category === category.id &&
                    transaction.amount < 0 &&
                    transDate.getMonth() === targetMonth.getMonth() &&
                    transDate.getFullYear() === targetMonth.getFullYear();
            })
            .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
          
          monthData[category.name] = categoryTotal;
        });
        
        result.push(monthData);
      }
    } else {
      // Données trimestrielles pour les 8 derniers trimestres
      for (let i = 0; i < 8; i++) {
        const targetQuarter = Math.floor((now.getMonth() - i * 3) / 3);
        const targetYear = currentYear - Math.floor(i / 4);
        const quarterStartMonth = targetQuarter * 3;
        const quarterLabel = `T${targetQuarter + 1} ${targetYear}`;
        
        const quarterData = {
          name: quarterLabel,
          period: `${targetYear}-Q${targetQuarter + 1}`,
        };
        
        // Ajouter les dépenses par catégorie
        categories.forEach(category => {
          const categoryTotal = allTransactions
            .filter(transaction => {
              const transDate = new Date(transaction.date);
              const transQuarter = Math.floor(transDate.getMonth() / 3);
              return transaction.category === category.id &&
                    transaction.amount < 0 &&
                    transQuarter === targetQuarter &&
                    transDate.getFullYear() === targetYear;
            })
            .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
          
          quarterData[category.name] = categoryTotal;
        });
        
        result.push(quarterData);
      }
    }
    
    // Inverser pour avoir les périodes les plus anciennes en premier
    return result.reverse();
  };

  // Préparer les données pour le graphique en barres
  const prepareBarChartData = () => {
    return categoryData
      .filter(cat => cat.id !== 8) // Exclure la catégorie "Revenus"
      .slice(0, 10); // Limiter aux 10 premières catégories
  };

  // Générer les données pour le graphique de tendance
  const prepareLineChartData = () => {
    // Sélectionner les 5 catégories avec les dépenses les plus élevées (hors revenus)
    const topCategories = categoryData
      .filter(cat => cat.id !== 8) // Exclure la catégorie "Revenus"
      .slice(0, 5)
      .map(cat => cat.name);
    
    return { data: trendData, categories: topCategories };
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

      {/* Statistiques par catégorie */}
      <Grid container spacing={3}>
        {/* Graphique en barres */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top des catégories de dépenses
            </Typography>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={prepareBarChartData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" name="Total des dépenses">
                    {prepareBarChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 10 }}>
                Aucune donnée disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Tableau des statistiques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Détails des dépenses par catégorie
            </Typography>
            {categoryData.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Catégorie</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Nb. Trans.</TableCell>
                      <TableCell align="right">Moyenne</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData
                      .filter(cat => cat.id !== 8) // Exclure la catégorie "Revenus"
                      .map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 10, 
                                  height: 10, 
                                  borderRadius: '50%',
                                  backgroundColor: category.color,
                                  mr: 1
                                }} 
                              />
                              {category.name}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(category.total)}</TableCell>
                          <TableCell align="right">{category.count}</TableCell>
                          <TableCell align="right">{formatCurrency(category.average)}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 10 }}>
                Aucune donnée disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Graphique de tendance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des dépenses par catégorie
            </Typography>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={prepareLineChartData().data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {prepareLineChartData().categories.map((category, index) => (
                    <Line 
                      key={category}
                      type="monotone" 
                      dataKey={category} 
                      stroke={categoryData.find(c => c.name === category)?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                      activeDot={{ r: 8 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 10 }}>
                Aucune donnée disponible
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryStats;