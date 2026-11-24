import { IconCheckbox, IconFolderOpen, IconTag } from '@tabler/icons-vue';

export type Task = {
  id: string;
  name: string;
  date: string | null;
  completed: boolean;
  tags?: string[];
  link?: string | null;
};

export type Category = {
  id: string;
  name: string;
  collapsed: boolean;
};

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export const types = [
  {
    id: 'task',
    name: 'Tâches',
    singular_name: 'Tâche',
    all_items: 'Toutes les tâches',
    add_item: 'Ajouter une tâche',
    edit_item: 'Modifier la tâche',
    update_item: 'Enregistrer la tâche',
    view_item: 'Afficher la tâche',
    view_items: 'Afficher les tâches',
    search_items: 'Chercher des tâches',
    not_found: 'Aucun tâche trouvée',
    items_list: 'Liste des tâches',
    filter_items: 'Filtrer les tâches',
    icon: IconCheckbox,
  },
  {
    id: 'tag',
    name: 'Étiquettes',
    singular_name: 'Étiquette',
    all_items: 'Toutes les étiquettes',
    add_item: 'Ajouter une étiquette',
    edit_item: "Modifier l'étiquette",
    update_item: "Enregistrer l'étiquette",
    view_item: "Afficher l'étiquette",
    view_items: 'Afficher les étiquettes',
    search_items: 'Chercher des étiquettes',
    not_found: 'Aucune étiquette trouvée',
    items_list: 'Liste des étiquettes',
    filter_items: 'Filtrer les étiquettes',
    icon: IconTag,
  },
  {
    id: 'category',
    name: 'Catégories',
    singular_name: 'Catégorie',
    all_items: 'Toutes les catégories',
    add_item: 'Ajouter une catégorie',
    edit_item: 'Modifier la catégorie',
    update_item: 'Enregistrer la catégorie',
    view_item: 'Afficher la catégorie',
    view_items: 'Afficher les catégories',
    search_items: 'Chercher des catégories',
    not_found: 'Aucune catégorie trouvée',
    items_list: 'Liste des catégories',
    filter_items: 'Filtrer les catégories',
    icon: IconFolderOpen,
  },
];

export const colors = [
  {
    id: 'red',
    name: 'Rouge',
  },
  {
    id: 'orange',
    name: 'Orange',
  },
  {
    id: 'amber',
    name: 'Ambre',
  },
  {
    id: 'yellow',
    name: 'Jaune',
  },
  {
    id: 'lime',
    name: 'Citron',
  },
  {
    id: 'green',
    name: 'Vert',
  },
  {
    id: 'emerald',
    name: 'Émeraude',
  },
  {
    id: 'teal',
    name: 'Thé',
  },
  {
    id: 'cyan',
    name: 'Cyan',
  },
  {
    id: 'sky',
    name: 'Ciel',
  },
  {
    id: 'blue',
    name: 'Bleu',
  },
  {
    id: 'indigo',
    name: 'Indigo',
  },
  {
    id: 'violet',
    name: 'Violet',
  },
  {
    id: 'purple',
    name: 'Pourpre',
  },
  {
    id: 'fuschia',
    name: 'Fuschia',
  },
  {
    id: 'pink',
    name: 'Rose',
  },
  {
    id: 'stone',
    name: 'Pierre',
  },
  {
    id: 'zinc',
    name: 'Zinc',
  },
  {
    id: 'gray',
    name: 'Gris',
  },
  {
    id: 'slate',
    name: 'Ardoise',
  },
];
