try {
  const Menus = require('@tiptap/react/menus');
  console.log('Exports from @tiptap/react/menus:', Object.keys(Menus));
} catch (e) {
  console.error('Error importing menus:', e.message);
}
