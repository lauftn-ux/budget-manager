import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const HelpGuide = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Importer vos relevés bancaires',
      description: 'Commencez par importer vos relevés bancaires au format CSV. L\'application supporte les formats de la plupart des banques françaises.',
      icon: <CloudUploadIcon />,
      details: (
        <>
          <Typography variant="body2" paragraph>
            Pour importer vos données, vous pouvez exporter un fichier CSV depuis votre espace bancaire en ligne. La plupart des banques proposent cette option.
          </Typography>
          <Typography variant="subtitle2" gutterBottom>Format attendu :</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Date - au format YYYY-MM-DD, JJ/MM/AAAA ou MM/JJ/AAAA" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Description - libellé de l'opération" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Montant - valeur positive pour un crédit, négative pour un débit" />
            </ListItem>
          </List>
          <Typography variant="body2">
            Vous pouvez également utiliser notre fichier exemple <code>exemple-operations.csv</code> disponible dans la page d'accueil.
          </Typography>
        </>
      )
    },
    {
      label: 'Classifier vos transactions',
      description: 'Associez chaque transaction à une catégorie pour mieux analyser vos dépenses.',
      icon: <CategoryIcon />,
      details: (
        <>
          <Typography variant="body2" paragraph>
            L'application propose plusieurs catégories par défaut, et vous pouvez créer vos propres catégories personnalisées.
          </Typography>
          <Typography variant="body2" paragraph>
            Pour gagner du temps, vous pouvez configurer des règles automatiques qui associent des mots-clés à des catégories spécifiques. Par exemple, associer "CARREFOUR" à la catégorie "Alimentation".
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Comment définir des règles automatiques :
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="1. Accédez à la section 'Catégories'" />
            </ListItem>
            <ListItem>
              <ListItemText primary="2. Cliquez sur 'Règles de catégorisation' pour une catégorie" />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. Ajoutez les mots-clés qui devraient être associés à cette catégorie" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      label: 'Visualiser vos dépenses',
      description: 'Consultez des graphiques et tableaux détaillés pour mieux comprendre où va votre argent.',
      icon: <DashboardIcon />,
      details: (
        <>
          <Typography variant="body2" paragraph>
            Le tableau de bord vous offre une vue d'ensemble de vos finances avec des graphiques et des indicateurs clés.
          </Typography>
          <Typography variant="subtitle2" gutterBottom>Visualisations disponibles :</Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><TrendingUpIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Évolution des revenus et dépenses sur les 6 derniers mois" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CategoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Répartition des dépenses par catégorie" />
            </ListItem>
            <ListItem>
              <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Top des catégories de dépenses" />
            </ListItem>
          </List>
        </>
      )
    },
    {
      label: 'Gérer votre budget',
      description: 'Définissez des budgets par catégorie et suivez votre progression.',
      icon: <AccountBalanceWalletIcon />,
      details: (
        <>
          <Typography variant="body2" paragraph>
            Fixez des limites de dépenses pour chaque catégorie et suivez votre progression par rapport à ces objectifs.
          </Typography>
          <Typography variant="subtitle2" gutterBottom>Fonctionnalités de budget :</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Budget mensuel, trimestriel ou annuel par catégorie" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Visualisation de la progression sous forme de barres de progression" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Alertes lorsque vous approchez ou dépassez un budget" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Comparaison graphique entre budget prévu et dépenses réelles" />
            </ListItem>
          </List>
        </>
      )
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const faqItems = [
    {
      question: "Comment importer des données depuis plusieurs comptes ?",
      answer: "Vous pouvez importer successivement plusieurs fichiers CSV. L'application conservera toutes les transactions importées. Pour une meilleure organisation, vous pouvez ajouter une note à chaque transaction pour indiquer le compte d'origine."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Toutes vos données sont stockées localement dans votre navigateur (via localStorage) et ne sont jamais envoyées à un serveur externe. Pour plus de sécurité, nous vous recommandons d'exporter régulièrement vos données en utilisant la fonction d'exportation disponible dans les paramètres."
    },
    {
      question: "Comment corriger une transaction mal catégorisée ?",
      answer: "Rendez-vous dans la section 'Transactions', trouvez la transaction concernée, puis cliquez sur l'icône d'édition. Vous pourrez alors modifier la catégorie ainsi que d'autres détails de la transaction."
    },
    {
      question: "Est-il possible de créer des catégories personnalisées ?",
      answer: "Oui, vous pouvez créer vos propres catégories dans la section 'Catégories' en cliquant sur le bouton 'Ajouter une catégorie'. Vous pourrez définir un nom, une couleur et une icône pour chaque nouvelle catégorie."
    },
    {
      question: "Comment sont gérées les transactions récurrentes ?",
      answer: "L'application ne gère pas automatiquement les transactions récurrentes, mais vous pouvez utiliser les règles de catégorisation pour classer automatiquement ces transactions. Par exemple, vous pouvez créer une règle pour que toutes les transactions contenant 'LOYER' soient automatiquement classées dans la catégorie 'Logement'."
    }
  ];

  const csvExample = `Date,Description,Montant
2025-03-01,Salaire Mars 2025,2800.00
2025-03-02,LOYER MARS,-950.00
2025-03-05,CARTE 04/03 CARREFOUR,-125.32
2025-03-10,CARTE 09/03 AMAZON,-49.99`;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          Guide d'utilisation
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Démarrage rapide
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel icon={step.icon}>{step.label}</StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                  <Box sx={{ mt: 2 }}>
                    {step.details}
                  </Box>
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mr: 1 }}
                      >
                        {index === steps.length - 1 ? 'Terminer' : 'Continuer'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Précédent
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>Vous avez terminé le guide de démarrage rapide !</Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Revoir le guide
              </Button>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Format du fichier CSV
        </Typography>
        <Paper sx={{ p: 2, mb: 4, backgroundColor: '#f5f5f5' }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', overflowX: 'auto' }}>
            {csvExample}
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Foire aux questions
        </Typography>
        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="medium">{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpGuide;