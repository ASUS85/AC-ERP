import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Supposons que ces composants existent déjà et sont importables
// Ils sont basés sur les noms de composants vus dans _app.settings-DHu1H2Ud.js
import { Button } from '@/components/ui/button'; // Renommé de B
import { Input } from '@/components/ui/input'; // Renommé de X
import { Label } from '@/components/ui/label'; // Renommé de K
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Renommé de D
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Pour les selects

// --- 1. Définition des schémas Zod pour chaque étape du wizard ---

// Schéma pour la première étape : Informations générales du bon de commande
const Step1Schema = z.object({
  fournisseurId: z.string().min(1, "Le fournisseur est obligatoire."),
  dateCommande: z.string().min(1, "La date de commande est obligatoire."),
  referenceFournisseur: z.string().optional(),
});

type Step1FormData = z.infer<typeof Step1Schema>;

// Schéma pour la deuxième étape : Détails des produits
const ProductSchema = z.object({
  productId: z.string().min(1, "Le produit est obligatoire."),
  quantite: z.coerce.number().min(1, "La quantité doit être au moins de 1."),
  prixUnitaire: z.coerce.number().min(0.01, "Le prix unitaire doit être positif."),
});

const Step2Schema = z.object({
  lignesCommande: z.array(ProductSchema).min(1, "Au moins un produit est requis."),
});

type Step2FormData = z.infer<typeof Step2Schema>;

// Schéma pour la troisième étape : Conditions de livraison et paiement
const Step3Schema = z.object({
  dateLivraisonPrevue: z.string().min(1, "La date de livraison prévue est obligatoire."),
  conditionsPaiement: z.string().min(1, "Les conditions de paiement sont obligatoires."),
  notes: z.string().optional(),
});

type Step3FormData = z.infer<typeof Step3Schema>;

// --- Composant d'entrée personnalisé (similaire à votre `x`) ---
// J'ai recréé une version simplifiée ici pour l'exemple.
// Dans votre code, vous utiliseriez probablement votre composant `x` existant.
interface CustomInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
}) => (
  <div className="space-y-1.5">
    <Label>
      {label} {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={!!error}
      className={error ? 'border-destructive' : ''}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// --- Composant du Wizard de création de Bon de Commande ---

export function CreatePurchaseOrderWizard() {
  const [step, setStep] = useState(1);

  // Formulaire pour l'étape 1
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      fournisseurId: '',
      dateCommande: new Date().toISOString().split('T')[0], // Date du jour par défaut
      referenceFournisseur: '',
    },
  });

  // Formulaire pour l'étape 2
  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      lignesCommande: [{ productId: '', quantite: 1, prixUnitaire: 0.01 }],
    },
  });

  // Formulaire pour l'étape 3
  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      dateLivraisonPrevue: '',
      conditionsPaiement: '',
      notes: '',
    },
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await step1Form.trigger();
      if (isValid) setStep(2);
    } else if (step === 2) {
      isValid = await step2Form.trigger();
      if (isValid) setStep(3);
    } else if (step === 3) {
      // Dernière étape, soumettre le formulaire complet
      isValid = await step3Form.trigger();
      if (isValid) {
        handleSubmitAllForms();
      }
    }
    if (!isValid) {
      toast.error("Veuillez corriger les erreurs avant de passer à l'étape suivante.");
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitAllForms = () => {
    const data1 = step1Form.getValues();
    const data2 = step2Form.getValues();
    const data3 = step3Form.getValues();

    // Ici, vous enverriez les données combinées à votre API backend
    console.log('Données complètes du bon de commande:', { ...data1, ...data2, ...data3 });
    toast.success('Bon de commande créé avec succès !');
    // Réinitialiser le formulaire ou rediriger
    step1Form.reset();
    step2Form.reset();
    step3Form.reset();
    setStep(1);
  };

  const {
    register: register1,
    formState: { errors: errors1 },
    setValue: setValue1,
    watch: watch1,
  } = step1Form;

  const {
    register: register2,
    formState: { errors: errors2 },
    control: control2,
    watch: watch2,
  } = step2Form;

  const {
    register: register3,
    formState: { errors: errors3 },
    setValue: setValue3,
    watch: watch3,
  } = step3Form;

  // Exemple de données pour les selects (à remplacer par vos données réelles)
  const fournisseurs = [{ id: 'f1', nom: 'Fournisseur A' }, { id: 'f2', nom: 'Fournisseur B' }];
  const produits = [{ id: 'p1', nom: 'Produit X' }, { id: 'p2', nom: 'Produit Y' }];
  const conditionsPaiementOptions = ['30 jours', '60 jours', 'À réception'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Créer un Bon de Commande (Étape {step}/3)</CardTitle>
        <CardDescription>
          {step === 1 && "Informations générales du bon de commande."}
          {step === 2 && "Détails des produits à commander."}
          {step === 3 && "Conditions de livraison et de paiement."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleNext)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fournisseurId">Fournisseur <span className="ml-1 text-destructive">*</span></Label>
              <Select
                onValueChange={(value) => setValue1('fournisseurId', value, { shouldValidate: true })}
                value={watch1('fournisseurId')}
              >
                <SelectTrigger className={errors1.fournisseurId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {fournisseurs.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors1.fournisseurId && <p className="text-xs text-destructive">{errors1.fournisseurId.message}</p>}
            </div>
            <CustomInput
              label="Date de commande"
              type="date"
              value={watch1('dateCommande')}
              onChange={(val) => setValue1('dateCommande', String(val), { shouldValidate: true })}
              error={errors1.dateCommande?.message}
              required
            />
            <CustomInput
              label="Référence fournisseur"
              placeholder="Référence interne du fournisseur"
              value={watch1('referenceFournisseur') || ''}
              onChange={(val) => setValue1('referenceFournisseur', String(val))}
              error={errors1.referenceFournisseur?.message}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit">Suivant</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2Form.handleSubmit(handleNext)} className="space-y-4">
            {/* Ici, vous auriez une logique pour ajouter/supprimer des lignes de commande */}
            {/* Pour simplifier, nous allons juste montrer un exemple de ligne */}
            {watch2('lignesCommande').map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 border p-4 rounded-md">
                <div className="space-y-1.5">
                  <Label htmlFor={`lignesCommande.${index}.productId`}>Produit <span className="ml-1 text-destructive">*</span></Label>
                  <Select
                    onValueChange={(value) => setValue2(`lignesCommande.${index}.productId`, value, { shouldValidate: true })}
                    value={item.productId}
                  >
                    <SelectTrigger className={errors2.lignesCommande?.[index]?.productId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionnez un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {produits.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors2.lignesCommande?.[index]?.productId && <p className="text-xs text-destructive">{errors2.lignesCommande[index]?.productId?.message}</p>}
                </div>
                <CustomInput
                  label="Quantité"
                  type="number"
                  placeholder="1"
                  value={item.quantite}
                  onChange={(val) => setValue2(`lignesCommande.${index}.quantite`, Number(val), { shouldValidate: true })}
                  error={errors2.lignesCommande?.[index]?.quantite?.message}
                  required
                />
                <CustomInput
                  label="Prix unitaire HT"
                  type="number"
                  placeholder="0.00"
                  value={item.prixUnitaire}
                  onChange={(val) => setValue2(`lignesCommande.${index}.prixUnitaire`, Number(val), { shouldValidate: true })}
                  error={errors2.lignesCommande?.[index]?.prixUnitaire?.message}
                  required
                />
              </div>
            ))}
            {errors2.lignesCommande && <p className="text-xs text-destructive">{errors2.lignesCommande.message}</p>}
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={handleBack}>Précédent</Button>
              <Button type="submit">Suivant</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={step3Form.handleSubmit(handleNext)} className="space-y-4">
            <CustomInput
              label="Date de livraison prévue"
              type="date"
              value={watch3('dateLivraisonPrevue')}
              onChange={(val) => setValue3('dateLivraisonPrevue', String(val), { shouldValidate: true })}
              error={errors3.dateLivraisonPrevue?.message}
              required
            />
            <div className="space-y-1.5">
              <Label htmlFor="conditionsPaiement">Conditions de paiement <span className="ml-1 text-destructive">*</span></Label>
              <Select
                onValueChange={(value) => setValue3('conditionsPaiement', value, { shouldValidate: true })}
                value={watch3('conditionsPaiement')}
              >
                <SelectTrigger className={errors3.conditionsPaiement ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Sélectionnez les conditions" />
                </SelectTrigger>
                <SelectContent>
                  {conditionsPaiementOptions.map((cond) => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors3.conditionsPaiement && <p className="text-xs text-destructive">{errors3.conditionsPaiement.message}</p>}
            </div>
            <CustomInput
              label="Notes"
              placeholder="Informations supplémentaires pour le fournisseur"
              value={watch3('notes') || ''}
              onChange={(val) => setValue3('notes', String(val))}
              error={errors3.notes?.message}
            />
            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={handleBack}>Précédent</Button>
              <Button type="submit">Finaliser la commande</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
