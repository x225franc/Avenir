# Composants UI

Bibliothèque de composants réutilisables construits avec Tailwind CSS et Headless UI.

## Button

Bouton avec variantes, tailles, icônes et état de chargement.

```vue
<UiButton variant="primary" size="md">
  Cliquez-moi
</UiButton>

<UiButton variant="danger" icon="heroicons:trash" :loading="isDeleting">
  Supprimer
</UiButton>
```

**Props** :
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' (défaut: 'primary')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `type`: 'button' | 'submit' | 'reset' (défaut: 'button')
- `disabled`: boolean
- `loading`: boolean
- `icon`: string (nom de l'icône)

---

## Input

Champ de saisie avec label, icône, validation et messages d'erreur.

```vue
<UiInput
  v-model="email"
  label="Email"
  type="email"
  placeholder="exemple@email.com"
  icon="heroicons:envelope"
  :error="emailError"
  required
/>
```

**Props** :
- `modelValue`: string | number
- `label`: string
- `type`: string (défaut: 'text')
- `placeholder`: string
- `disabled`: boolean
- `required`: boolean
- `error`: string
- `hint`: string
- `icon`: string
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')

**Emits** :
- `update:modelValue`: (value: string) => void

---

## Card

Carte avec en-tête, corps et pied de page optionnels.

```vue
<UiCard title="Mon titre" padding="md" :hoverable="true">
  <p>Contenu de la carte</p>

  <template #footer>
    <UiButton variant="primary">Action</UiButton>
  </template>
</UiCard>
```

**Props** :
- `title`: string
- `padding`: 'none' | 'sm' | 'md' | 'lg' (défaut: 'md')
- `hoverable`: boolean (défaut: false)

**Slots** :
- `header`: En-tête personnalisé
- `default`: Corps de la carte
- `footer`: Pied de page

---

## Modal

Modal avec animation, backdrop et gestion de fermeture.

```vue
<UiModal v-model="isOpen" title="Mon Modal" size="md" :closable="true">
  <p>Contenu du modal</p>

  <template #footer>
    <UiButton variant="ghost" @click="isOpen = false">Annuler</UiButton>
    <UiButton variant="primary" @click="handleSubmit">Confirmer</UiButton>
  </template>
</UiModal>
```

**Props** :
- `modelValue`: boolean (contrôle l'ouverture/fermeture)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (défaut: 'md')
- `closable`: boolean (défaut: true)

**Slots** :
- `header`: En-tête personnalisé
- `default`: Corps du modal
- `footer`: Pied de page avec actions

**Emits** :
- `update:modelValue`: (value: boolean) => void

---

## Table

Tableau avec colonnes, état de chargement et actions.

```vue
<UiTable
  :columns="[
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
  ]"
  :data="users"
  :loading="isLoading"
  empty-message="Aucun utilisateur trouvé"
>
  <!-- Custom cell rendering -->
  <template #cell-role="{ value }">
    <UiBadge :variant="value === 'admin' ? 'danger' : 'gray'">
      {{ value }}
    </UiBadge>
  </template>

  <!-- Actions column -->
  <template #actions="{ row }">
    <UiButton variant="ghost" size="sm" @click="editUser(row)">
      Modifier
    </UiButton>
  </template>
</UiTable>
```

**Props** :
- `columns`: Array<{ key: string, label: string }>
- `data`: any[]
- `loading`: boolean (défaut: false)
- `emptyMessage`: string (défaut: 'Aucune donnée disponible')

**Slots** :
- `cell-{key}`: Rendu personnalisé pour une colonne (reçoit `row` et `value`)
- `actions`: Colonne d'actions (reçoit `row`)

---

## Badge

Badge coloré avec variantes et icônes.

```vue
<UiBadge variant="success" icon="heroicons:check">Actif</UiBadge>
<UiBadge variant="danger">Inactif</UiBadge>
```

**Props** :
- `variant`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray' (défaut: 'gray')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `icon`: string

---

## Alert

Alerte avec variantes, icônes automatiques et fermeture optionnelle.

```vue
<UiAlert variant="success" title="Succès" :closable="true">
  Votre action a été effectuée avec succès.
</UiAlert>

<UiAlert variant="danger">
  Une erreur s'est produite.
</UiAlert>
```

**Props** :
- `variant`: 'info' | 'success' | 'warning' | 'danger' (défaut: 'info')
- `title`: string
- `icon`: string (auto-généré selon la variante si non fourni)
- `closable`: boolean (défaut: false)

**Emits** :
- `close`: () => void

---

## Utilisation

Tous les composants sont auto-importés grâce à Nuxt. Il suffit de les utiliser avec le préfixe `Ui` :

```vue
<template>
  <div>
    <UiButton>Mon bouton</UiButton>
    <UiInput v-model="value" />
    <UiCard title="Ma carte">...</UiCard>
  </div>
</template>
```

## Icônes

Les composants utilisent `@nuxt/icon` avec les icônes Heroicons. Format : `heroicons:{nom-icone}`

Exemples :
- `heroicons:home`
- `heroicons:user`
- `heroicons:check-circle`
- `heroicons:x-mark`
- `heroicons:trash`

Voir toutes les icônes : https://icones.js.org/collection/heroicons
