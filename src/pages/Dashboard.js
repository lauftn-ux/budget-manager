import React, { useContext, useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  ButtonGroup,
  Button,
  Tab,
  Tabs,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AppContext } from '../context/AppContext';
import CSVImport from '../components/CSVImport';
import CategoryStats from '../components/CategoryStats';
import HelpGuide from '../components/HelpGuide';

// TabPanel component for handling tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { transactions, categories, calculateTotals } = useContext(AppContext);
  const [totals, setTotals] = useState({ income: 0, expense: 0, byCategory: {} });
  const [timeRange, setTimeRange] = useState('month'); // 'month', 'quarter', 'year'
  const [chartData, setChartData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  // Calculer les totaux et préparer les données du graphique
  useEffect(() => {
    if (transactions.length > 0) {
      const calculatedTotals = calculateTotals();
      setTotals(calculatedTotals);

      // Filtrer les transactions selon la période sélectionnée
      const now = new Date();
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        if (timeRange === 'month') {
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        } else if (timeRange === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
          return transactionQuarter === currentQuarter && 
                 transactionDate.getFullYear() === now.getFullYear();
        } else if (timeRange === 'year') {
          return transactionDate.getFullYear() === now.getFullYear();
        }
        return true;
      });

      // Préparer les données pour le graphique en camembert
      const pieData = [];
      categories.forEach(category => {
        const amount = calculatedTotals.byCategory[category.id] || 0;
        if (amount < 0) { // Seulement les dépenses pour le camembert
          pieData.push({
            name: category.name,
            value: Math.abs(amount),
            color: category.color
          });
        }
      });
      setChartData(pieData);

      // Préparer les données mensuelles pour le graphique en barres
      const monthlyTransactions = {};
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyTransactions[monthYear]) {
          monthlyTransactions[monthYear] = { name: monthYear, expense: 0, income: 0 };
        }
        
        if (transaction.amount > 0) {
          monthlyTransactions[monthYear].income += transaction.amount;
        } else {
          monthlyTransactions[monthYear].expense += Math.abs(transaction.amount);
        }
      });

      // Convertir en tableau pour le graphique et trier par date
      const monthlyArray = Object.values(monthlyTransactions);
      monthlyArray.sort((a, b) => a.name.localeCompare(b.name));
      
      // Prendre les 6 derniers mois
      setMonthlyData(monthlyArray.slice(-6));
    }
  }, [transactions, categories, calculateTotals, timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Tableau de bord
        </Typography>
        <Tooltip title="Aide">
          <Fab 
            size="small" 
            color="primary" 
            onClick={() => setHelpOpen(true)}
          >
            <HelpOutlineIcon />
          </Fab>
        </Tooltip>
      </Box>

      {transactions.length === 0 ? (
        <Box>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bienvenue dans votre gestionnaire de budget !
              </Typography>
              <Typography variant="body1" paragraph>
                Pour commencer, importez vos transactions bancaires à partir d'un fichier CSV.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous pouvez utiliser le fichier exemple disponible <a href="exemple-operations.csv" download>ici</a>.
              </Typography>
            </CardContent>
          </Card>
          <CSVImport />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Filtres de période */}
          <Grid item xs={12}>
            <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
              <Button 
                onClick={() => setTimeRange('month')}
                variant={timeRange === 'month' ? 'contained' : 'outlined'}
              >
                Ce mois
              </Button>
              <Button 
                onClick={() => setTimeRange('quarter')}
                variant={timeRange === 'quarter' ? 'contained' : 'outlined'}
              >
                Ce trimestre
              </Button>
              <Button 
                onClick={() => setTimeRange('year')}
                variant={timeRange === 'year' ? 'contained' : 'outlined'}
              >
                Cette année
              </Button>
            </ButtonGroup>
          </Grid>

          {/* Cartes de résumé */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Revenus
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  {formatCurrency(totals.income)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Dépenses
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  {formatCurrency(totals.expense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Solde
                </Typography>
                <Typography 
                  variant="h5" 
                  component="div" 
                  color={totals.income - totals.expense >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(totals.income - totals.expense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Onglets pour les différentes vues */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                <Tab label="Aperçu" />
                <Tab label="Analyse par catégorie" />
              </Tabs>
            </Box>
            
            {/* Onglet Aperçu */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Graphique en camembert */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography variant="h6" gutterBottom>
                      Répartition des dépenses
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Graphique d'évolution mensuelle */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography variant="h6" gutterBottom>
                      Évolution mensuelle
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="income" name="Revenus" fill="#4caf50" />
                        <Bar dataKey="expense" name="Dépenses" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Top des catégories de dépenses */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Top des catégories de dépenses
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {chartData
                        .filter(cat => cat.value > 0)
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                        .map((category, index) => (
                          <Card key={index} sx={{ minWidth: 200, flexGrow: 1 }}>
                            <CardContent>
                              <Typography variant="body2" color="textSecondary">
                                {category.name}
                              </Typography>
                              <Typography variant="h6">
                                {formatCurrency(category.value)}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Onglet Analyse par catégorie */}
            <TabPanel value={tabValue} index={1}>
              <CategoryStats />
            </TabPanel>
          </Grid>
        </Grid>
      )}

      {/* Composant d'aide */}
      <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />
    </Box>
  );
};

export default Dashboard;