(() => {
  const roster = document.querySelector('.squad-roster');
  if (!roster) return;
  const buttons = [...roster.querySelectorAll('[data-roster-filter]')];
  const groups = [...roster.querySelectorAll('[data-roster-group]')];
  const status = roster.querySelector('[data-roster-status]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const role = button.dataset.rosterFilter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let visiblePlayers = 0;
      groups.forEach(group => {
        group.hidden = role !== 'all' && role !== group.dataset.rosterGroup;
        if (!group.hidden) visiblePlayers += group.querySelectorAll('.squad-player').length;
      });
      if (status) status.textContent = `${visiblePlayers} giocatori: ${button.textContent.trim().toLowerCase()}.`;
    });
  });
})();
