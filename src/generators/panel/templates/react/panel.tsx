import React from 'react';
import { createRoot } from 'react-dom/client';
import { <%- elementName %> } from './<%- elementName %>';

const root = createRoot(document.getElementById('root')!);
root.render(<<%- elementName %> />);
