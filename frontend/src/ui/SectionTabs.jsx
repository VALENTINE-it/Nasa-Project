export default function SectionTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  // If tabs have groups, group them and render thin dividers between groups
  const groups = []
  let currentGroup = []
  let lastGroupKey = null

  tabs.forEach((tab) => {
    const key = tab.group || 'default'
    if (lastGroupKey !== null && key !== lastGroupKey) {
      groups.push(currentGroup)
      currentGroup = []
    }
    currentGroup.push(tab)
    lastGroupKey = key
  })
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return (
    <nav className={`hd-tabs-container ${className}`} aria-label="Section navigation">
      <div className="hd-tabs" role="tablist">
        {groups.map((group, groupIdx) => (
          <div key={`group-${groupIdx}`} className="hd-tab-group">
            {groupIdx > 0 && <div className="hd-tab-divider" aria-hidden="true" />}
            {group.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-current={isActive ? 'page' : undefined}
                  aria-controls={`panel-${tab.id}`}
                  title={tab.subtitle || tab.label}
                  className={`hd-tab ${isActive ? 'hd-tab--active' : ''}`}
                  onClick={() => onChange(tab.id)}
                >
                  {Icon && <Icon size={16} strokeWidth={2} className="hd-tab__icon" />}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge !== null && tab.badge > 0 && (
                    <span className="hd-tab__badge" aria-label={`${tab.badge} alerts`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}
