import React, { useState, useContext } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { AppContext } from '../context/AppContext';

const CSVImport = () => {
  const { importTransactionsFromCSV } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Veuillez sélectionner un fichier CSV valide.');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Aucun fichier sélectionné.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importTransactionsFromCSV(file);
      setImportResult({
        count: result.length,
        success: true
      });
      setOpenDialog(true);
    } catch (err) {
      console.error('Erreur d'importation :', err);
      setError('Erreur lors de l'importation du fichier. Vérifiez le format CSV.');
    } finally {
      setIsLoading(false);
      setFile(null);
      // Réinitialiser le champ de fichier
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImportResult(null);
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          mb: 3,
          border: '1px dashed #ccc',
        }}
      >
        <UploadFileIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Importer vos transactions
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Supporté : fichiers CSV des principales banques françaises
        </Typography>
        
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-file-input">
          <Button
            variant="outlined"
            component="span"
            sx={{ mb: 2 }}
          >
            Sélectionner un fichier CSV
          </Button>
        </label>
        
        {file && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Fichier sélectionné : {file.name}
          </Typography>
        )}
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleImport}
          disabled={!file || isLoading}
          sx={{ width: '200px' }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Importer'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Importation réussie</DialogTitle>
        <DialogContent>
          <Typography>
            {importResult && `${importResult.count} transactions ont été importées avec succès.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CSVImport;