import React from 'react';
import Sidebar from './Sidebar.jsx';

/**
 * AppSidebar: Backward-compatible wrapper delegating directly to the
 * fixed 3-zone Sidebar component.
 */
export default function AppSidebar(props) {
  return <Sidebar {...props} />;
}
