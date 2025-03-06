import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from '../context/AppContext';

// Liste d'icônes disponibles
const availableIcons = [
  'home', 'restaurant', 'directions_car', 'local_hospital', 'shopping_bag',
  'sports_esports', 'school', 'work', 'flight_takeoff', 'fitness_center',
  'local_bar', 'theaters', 'payments', 'account_balance', 'help'
];

// Couleurs prédéfinies
const colorOptions = [
  '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', 
  '#e91e63', '#00bcd4', '#8bc34a', '#cddc39', '#795548'
];

const Categories = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    transactions,
    categoryRules,
    addCategoryRule,
    deleteCategoryRule
  } = useContext(AppContext);

  // État pour le dialogue d'édition ou d'ajout de catégorie
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#4caf50',
    icon: 'category'
  });

  // État pour le dialogue des règles de catégorisation
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [selectedCategoryForRules, setSelectedCategoryForRules] = useState(null);
  const [newRuleKeyword, setNewRuleKeyword] = useState('');

  // État pour la confirmation de suppression
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Gestion du formulaire de catégorie
  const handleOpenCategoryDialog = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setCategoryForm({
        name: category.name,
        color: category.color,
        icon: category.icon
      });
      setIsNewCategory(false);
    } else {
      setCurrentCategory(null);
      setCategoryForm({
        name: '',
        color: '#4caf50',
        icon: 'category'
      });
      setIsNewCategory(true);
    }
    setDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setDialogOpen(false);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
  };

  const handleCategorySubmit = () => {
    if (isNewCategory) {
      addCategory(categoryForm);
    } else {
      updateCategory(currentCategory.id, categoryForm);
    }
    handleCloseCategoryDialog();
  };

  // Gestion de la suppression de catégorie
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  // Gestion des règles de catégorisation automatique
  const handleOpenRulesDialog = (category) => {
    setSelectedCategoryForRules(category);
    setNewRuleKeyword('');
    setRulesDialogOpen(true);
  };

  const handleCloseRulesDialog = () => {
    setRulesDialogOpen(false);
    setSelectedCategoryForRules(null);
  };

  const handleAddRule = () => {
    if (newRuleKeyword.trim() && selectedCategoryForRules) {
      addCategoryRule({
        id: Date.now().toString(),
        keyword: newRuleKeyword.trim(),
        categoryId: selectedCategoryForRules.id
      });
      setNewRuleKeyword('');
    }
  };

  const handleDeleteRule = (ruleId) => {
    deleteCategoryRule(ruleId);
  };

  // Comptage des transactions par catégorie
  const countTransactionsByCategory = (categoryId) => {
    return transactions.filter(t => t.category === categoryId).length;
  };

  // Filtrer les règles pour la catégorie sélectionnée
  const getCategoryRules = (categoryId) => {
    return categoryRules.filter(rule => rule.categoryId === categoryId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Catégories
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenCategoryDialog()}
        >
          Ajouter une catégorie
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card 
              sx={{ 
                height: '100%',
                borderLeft: `5px solid ${category.color}`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {category.name}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenCategoryDialog(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    {category.id > 9 && ( // Empêcher la suppression des catégories par défaut
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteClick(category)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {countTransactionsByCategory(category.id)} transactions
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleOpenRulesDialog(category)}
                  sx={{ mt: 2 }}
                >
                  Règles de catégorisation
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogue d'ajout/édition de catégorie */}
      <Dialog open={dialogOpen} onClose={handleCloseCategoryDialog}>
        <DialogTitle>
          {isNewCategory ? 'Ajouter une catégorie' : 'Modifier la catégorie'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom de la catégorie"
              name="name"
              value={categoryForm.name}
              onChange={handleCategoryFormChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Couleur</InputLabel>
              <Select
                name="color"
                value={categoryForm.color}
                label="Couleur"
                onChange={handleCategoryFormChange}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color} value={color}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      bgcolor: color,
                      borderRadius: '50%',
                      mr: 1
                    }} />
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Icône</InputLabel>
              <Select
                name="icon"
                value={categoryForm.icon}
                label="Icône"
                onChange={handleCategoryFormChange}
              >
                {availableIcons.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    {icon}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Annuler</Button>
          <Button 
            onClick={handleCategorySubmit} 
            variant="contained" 
            color="primary"
            disabled={!categoryForm.name.trim()}
          >
            {isNewCategory ? 'Ajouter' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue des règles de catégorisation */}
      <Dialog 
        open={rulesDialogOpen} 
        onClose={handleCloseRulesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategoryForRules && `Règles pour "${selectedCategoryForRules.name}"`}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Les règles de catégorisation permettent d'affecter automatiquement une catégorie 
            aux transactions importées lorsque leur description contient un mot-clé spécifique.
          </Alert>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ajouter une nouvelle règle
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Mot-clé (ex: CARREFOUR)"
                value={newRuleKeyword}
                onChange={(e) => setNewRuleKeyword(e.target.value)}
              />
              <Button 
                variant="contained" 
                onClick={handleAddRule} 
                disabled={!newRuleKeyword.trim()}
                sx={{ ml: 1 }}
              >
                Ajouter
              </Button>
            </Box>
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            Règles existantes
          </Typography>
          
          {selectedCategoryForRules && getCategoryRules(selectedCategoryForRules.id).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucune règle définie pour cette catégorie.
            </Typography>
          ) : (
            <List>
              {selectedCategoryForRules && getCategoryRules(selectedCategoryForRules.id).map((rule) => (
                <React.Fragment key={rule.id}>
                  <ListItem>
                    <ListItemText primary={rule.keyword} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteRule(rule.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRulesDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette catégorie ? 
            Les transactions associées seront déplacées vers "Non catégorisé".
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

export default Categories;