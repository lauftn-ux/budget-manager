import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  LinearProgress,
  Tooltip,
  Card,
  CardContent,
  Alert,
  AlertTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { AppContext } from '../context/AppContext';
import BudgetCharts from '../components/BudgetCharts';

const Budget = () => {
  const { categories, transactions } = useContext(AppContext);

  // État pour les budgets
  const [budgets, setBudgets] = useState([]);
  
  // État pour le dialogue d'ajout/édition
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [isNewBudget, setIsNewBudget] = useState(true);
  const [formValues, setFormValues] = useState({
    category: '',
    amount: '',
    period: 'monthly' // 'monthly', 'quarterly', 'yearly'
  });

  // État pour la confirmation de suppression
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Charger les budgets depuis le localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Sauvegarder les budgets dans le localStorage
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Calculer les dépenses actuelles pour chaque catégorie
  const calculateCurrentSpending = (categoryId) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrer les transactions pour la période actuelle
    return transactions
      .filter(transaction => {
        const transDate = new Date(transaction.date);
        return transaction.category === categoryId &&
               transaction.amount < 0 && // Seulement les dépenses
               transDate.getMonth() === currentMonth &&
               transDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  };

  // Calculer le budget total
  const calculateTotalBudget = () => {
    return budgets.reduce((total, budget) => total + parseFloat(budget.amount), 0);
  };

  // Calculer les dépenses totales
  const calculateTotalSpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter(transaction => {
        const transDate = new Date(transaction.date);
        return transaction.amount < 0 && // Seulement les dépenses
               transDate.getMonth() === currentMonth &&
               transDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  };

  // Format des montants en devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Calculer le pourcentage du budget utilisé
  const calculatePercentage = (spending, budget) => {
    return (spending / budget) * 100;
  };

  // Gestion des dialogues
  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setCurrentBudget(budget);
      setFormValues({
        category: budget.category,
        amount: budget.amount,
        period: budget.period
      });
      setIsNewBudget(false);
    } else {
      setCurrentBudget(null);
      setFormValues({
        category: '',
        amount: '',
        period: 'monthly'
      });
      setIsNewBudget(true);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = () => {
    if (isNewBudget) {
      // Vérifier si un budget existe déjà pour cette catégorie
      const existingBudget = budgets.find(b => b.category === formValues.category);
      if (existingBudget) {
        // Mettre à jour le budget existant
        setBudgets(
          budgets.map(budget => 
            budget.category === formValues.category 
              ? { ...budget, amount: formValues.amount, period: formValues.period } 
              : budget
          )
        );
      } else {
        // Ajouter un nouveau budget
        setBudgets([
          ...budgets, 
          { 
            id: Date.now().toString(),
            category: formValues.category,
            amount: formValues.amount,
            period: formValues.period
          }
        ]);
      }
    } else {
      // Mettre à jour un budget existant
      setBudgets(
        budgets.map(budget => 
          budget.id === currentBudget.id 
            ? { 
                ...budget, 
                category: formValues.category,
                amount: formValues.amount,
                period: formValues.period
              } 
            : budget
        )
      );
    }
    handleCloseDialog();
  };

  // Gestion de la suppression
  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      setBudgets(budgets.filter(budget => budget.id !== budgetToDelete.id));
    }
    setDeleteConfirmOpen(false);
    setBudgetToDelete(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Budget
      </Typography>

      {budgets.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Commencez à planifier votre budget</AlertTitle>
          Vous n'avez pas encore défini de budgets. Créez votre premier budget en cliquant sur le bouton ci-dessous.
        </Alert>
      ) : (
        <>
          {/* Résumé du budget */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Budget total
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(calculateTotalBudget())}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Dépenses actuelles
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(calculateTotalSpending())}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Restant
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"
                    color={calculateTotalBudget() - calculateTotalSpending() >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(calculateTotalBudget() - calculateTotalSpending())}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Visualisations */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Visualisations
        </Typography>
        <BudgetCharts />
      </Box>

      {/* Tableau des budgets */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Budgets définis
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un budget
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Catégorie</TableCell>
              <TableCell>Période</TableCell>
              <TableCell align="right">Montant budgété</TableCell>
              <TableCell align="right">Dépenses actuelles</TableCell>
              <TableCell>Progression</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun budget défini. Cliquez sur "Ajouter un budget" pour commencer.
                </TableCell>
              </TableRow>
            ) : (
              budgets.map((budget) => {
                const categoryId = parseInt(budget.category);
                const category = categories.find(c => c.id === categoryId) || { name: 'Inconnue', color: '#9e9e9e' };
                const currentSpending = calculateCurrentSpending(categoryId);
                const percentage = calculatePercentage(currentSpending, budget.amount);
                const isOverBudget = percentage > 100;
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                      }}>
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
                    <TableCell>
                      {budget.period === 'monthly' ? 'Mensuel' : 
                       budget.period === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(budget.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(currentSpending)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage, 100)} 
                            color={isOverBudget ? "error" : "primary"}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${Math.round(percentage)}%`}
                          </Typography>
                        </Box>
                        {isOverBudget && (
                          <Tooltip title="Budget dépassé !">
                            <InfoIcon color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(budget)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(budget)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue d'ajout/édition de budget */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {isNewBudget ? 'Ajouter un budget' : 'Modifier le budget'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={formValues.category}
                label="Catégorie"
                onChange={handleInputChange}
              >
                {categories
                  .filter(c => c.id !== 8) // Exclure la catégorie "Revenus"
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Montant"
              name="amount"
              type="number"
              inputProps={{ min: "0", step: "0.01" }}
              value={formValues.amount}
              onChange={handleInputChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Période</InputLabel>
              <Select
                name="period"
                value={formValues.period}
                label="Période"
                onChange={handleInputChange}
              >
                <MenuItem value="monthly">Mensuel</MenuItem>
                <MenuItem value="quarterly">Trimestriel</MenuItem>
                <MenuItem value="yearly">Annuel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formValues.category || !formValues.amount}
          >
            {isNewBudget ? 'Ajouter' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce budget ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budget;