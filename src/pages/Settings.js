import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  SaveAlt as SaveAltIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { AppContext } from '../context/AppContext';

const Settings = () => {
  const { transactions } = useContext(AppContext);
  
  // États pour les paramètres
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  
  // États pour les dialogues
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Gérer le changement des paramètres
  const handleDarkModeChange = (event) => {
    const isDarkMode = event.target.checked;
    setDarkMode(isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    // Ici, vous pourriez implémenter un changement de thème
  };

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const handleDateFormatChange = (event) => {
    const newFormat = event.target.value;
    setDateFormat(newFormat);
    localStorage.setItem('dateFormat', newFormat);
  };

  // Exportation des données
  const handleExport = () => {
    // Préparer les données à exporter
    const dataToExport = {
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      categories: JSON.parse(localStorage.getItem('categories') || '[]'),
      categoryRules: JSON.parse(localStorage.getItem('categoryRules') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
      exportDate: new Date().toISOString()
    };
    
    // Convertir en JSON et créer un Blob
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Créer un lien de téléchargement et le déclencher
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Exportation réussie',
      severity: 'success'
    });
  };

  // Importation des données
  const handleImportFileChange = (event) => {
    setImportFile(event.target.files[0]);
  };

  const handleImport = () => {
    if (!importFile) {
      setSnackbar({
        open: true,
        message: 'Aucun fichier sélectionné',
        severity: 'error'
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Vérifier si les données sont valides
        if (!data.transactions || !data.categories) {
          throw new Error('Format de fichier invalide');
        }
        
        // Importer les données
        localStorage.setItem('transactions', JSON.stringify(data.transactions));
        localStorage.setItem('categories', JSON.stringify(data.categories));
        localStorage.setItem('categoryRules', JSON.stringify(data.categoryRules || []));
        localStorage.setItem('budgets', JSON.stringify(data.budgets || []));
        
        setImportDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Importation réussie. Veuillez rafraîchir la page.',
          severity: 'success'
        });

        // Recharger la page après un court délai
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Erreur d\'importation:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de l\'importation: format de fichier invalide',
          severity: 'error'
        });
      }
    };
    
    reader.readAsText(importFile);
  };

  // Réinitialisation des données
  const handleReset = () => {
    localStorage.removeItem('transactions');
    localStorage.removeItem('categories');
    localStorage.removeItem('categoryRules');
    localStorage.removeItem('budgets');
    
    setResetConfirmOpen(false);
    setSnackbar({
      open: true,
      message: 'Toutes les données ont été réinitialisées. Veuillez rafraîchir la page.',
      severity: 'success'
    });

    // Recharger la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Gérer la fermeture des snackbars
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Exporter en CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      setSnackbar({
        open: true,
        message: 'Aucune transaction à exporter',
        severity: 'warning'
      });
      return;
    }
    
    // Créer l'en-tête CSV
    let csvContent = 'Date,Description,Montant,Catégorie,Notes\n';
    
    // Ajouter les données des transactions
    transactions.forEach(transaction => {
      const category = JSON.parse(localStorage.getItem('categories') || '[]')
        .find(c => c.id === transaction.category)?.name || 'Non catégorisé';
      
      // Formater les données et échapper les virgules dans les champs textuels
      const row = [
        transaction.date,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount,
        `"${category}"`,
        `"${(transaction.notes || '').replace(/"/g, '""')}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Créer un Blob et lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Exportation CSV réussie',
      severity: 'success'
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      
      <Grid container spacing={3}>
        {/* Préférences d'affichage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Préférences d'affichage
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Mode sombre" 
                  secondary="Activer le thème sombre pour l'application"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleDarkModeChange}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Devise" 
                  secondary="Sélectionner la devise à utiliser pour afficher les montants"
                />
                <TextField
                  select
                  size="small"
                  value={currency}
                  onChange={handleCurrencyChange}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ width: 100 }}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </TextField>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Format de date" 
                  secondary="Choisir comment les dates sont affichées"
                />
                <TextField
                  select
                  size="small"
                  value={dateFormat}
                  onChange={handleDateFormatChange}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ width: 150 }}
                >
                  <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                </TextField>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Gestion des données */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gestion des données
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Exporter les données" 
                  secondary="Sauvegarder toutes vos données dans un fichier"
                />
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => setExportDialogOpen(true)}
                >
                  Exporter
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SaveAltIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Exporter en CSV" 
                  secondary="Exporter vos transactions au format CSV"
                />
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handleExportCSV}
                >
                  CSV
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CloudUploadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Importer des données" 
                  secondary="Restaurer vos données à partir d'un fichier de sauvegarde"
                />
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => setImportDialogOpen(true)}
                >
                  Importer
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <DeleteForeverIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Réinitialiser toutes les données" 
                  secondary="Effacer toutes vos données (cette action est irréversible)"
                />
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => setResetConfirmOpen(true)}
                >
                  Réinitialiser
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Informations sur l'application */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoOutlinedIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                À propos
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              Gestionnaire de Budget v1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Une application web pour gérer vos finances personnelles en toute simplicité.
              Importez vos relevés bancaires, catégorisez vos dépenses et suivez votre budget.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                Toutes vos données sont stockées localement dans votre navigateur. 
                Pensez à exporter régulièrement vos données pour éviter toute perte.
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogs */}
      {/* Dialogue de confirmation de réinitialisation */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
      >
        <DialogTitle>Confirmer la réinitialisation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Attention ! Cette action effacera définitivement toutes vos données, y compris les transactions, catégories et budgets. Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleReset} color="error" variant="contained">
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'exportation */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      >
        <DialogTitle>Exporter les données</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous êtes sur le point d'exporter toutes vos données dans un fichier JSON. Ce fichier pourra être utilisé ultérieurement pour restaurer vos données.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleExport} color="primary" variant="contained">
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'importation */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      >
        <DialogTitle>Importer des données</DialogTitle>
        <DialogContent>
          <DialogContentText>
            L'importation remplacera toutes vos données actuelles. Assurez-vous de sélectionner un fichier de sauvegarde valide.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-file-input"
              type="file"
              onChange={handleImportFileChange}
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
              >
                Sélectionner un fichier
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fichier sélectionné : {importFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleImport} 
            color="primary" 
            variant="contained"
            disabled={!importFile}
          >
            Importer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;