import {
  BookOpen,
  BookmarkCheck,
  Layers,
  Barcode,
  Calendar,
  DollarSign,
  ShoppingBag,
  Globe,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';

/**
 * Library Role Menu Configuration
 */
export const getLibraryMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    ]
  },
  {
    title: 'CIRCULATION',
    items: [
      { id: 'circulation', label: 'Issue & Return', icon: BookmarkCheck },
      { id: 'catalog', label: 'Book Catalog', icon: Layers },
      { id: 'inventory', label: 'Inventory', icon: Barcode },
      { id: 'reservations', label: 'Reservations', icon: Calendar },
      { id: 'fines', label: 'Fines & Dues', icon: DollarSign },
    ]
  },
  {
    title: 'ACQUISITIONS',
    items: [
      { id: 'acquisitions', label: 'Acquisitions', icon: ShoppingBag },
      { id: 'digital', label: 'Digital Resources', icon: Globe },
    ]
  },
  {
    title: 'REPORTS',
    items: [
      { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
    ]
  },
  {
    title: 'COMMUNICATION',
    items: [
      { id: 'campus-connect', label: 'Campus Connect', icon: MessageSquare },
    ]
  }
];

export default getLibraryMenuConfig;

