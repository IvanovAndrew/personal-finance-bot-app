import React from 'react';

export const theme = {
  colors: {
    bgApp: '#0A0A0C',
    bgCard: '#161618',
    bgElement: '#2C2C2E',
    border: '#2C2C2E',
    borderLight: '#48484A',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#AAA',

    // The main color
    primary: '#20B2AA',          // for button and main elements
    primaryLight: 'rgba(32, 178, 170, 0.15)', // 

    // additional
    danger: '#FF453A',
    success: '#20B2AA',
  },
  radius: {
    sm: '10px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '24px',
  }
};

export const commonStyles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    border: `1px solid ${theme.colors.border}`,
    boxSizing: 'border-box',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSub: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
    margin: '-8px 0 2px 0',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '10px',
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    alignItems: 'flex-start',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    fontSize: '14px',
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '18px',
    border: 'none',
    backgroundColor: theme.colors.primary,
    color: '#000000',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'opacity 0.2s ease',
  },
  inputControl: {
    height: '38px',
    width: '100%',
    boxSizing: 'border-box' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    backgroundColor: theme.colors.bgElement,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    color: theme.colors.textPrimary,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
  },
};

export const appStyles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    width: '100%',
    maxWidth: '440px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: theme.colors.bgApp,
    color: '#F2F2F7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    position: 'relative',
    overflowX: 'hidden',
  },
  content: {
    flex: 1,
    padding: '12px 16px',
    paddingBottom: '80px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  typeToggleGroup: {
    display: 'flex',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '4px',
    border: `1px solid ${theme.colors.border}`,
  },
  typeBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  typeBtnExpenseActive: { backgroundColor: theme.colors.bgElement, color: theme.colors.danger },
  typeBtnIncomeActive: { backgroundColor: theme.colors.bgElement, color: theme.colors.success },

  heroCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.full,
    padding: '12px 16px',
    textAlign: 'center',
    border: `1px solid ${theme.colors.border}`,
    position: 'relative',
  },
  heroSubLabel: {
    fontSize: '11px',
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroAmountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  heroSign: { fontSize: '28px', fontWeight: '700' },
  heroAmountText: { fontSize: '40px', fontWeight: '800', color: theme.colors.textPrimary },

  currencyBadge: {
    backgroundColor: theme.colors.primaryLight,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.radius.md,
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    marginLeft: '6px',
  },

  numpadGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  numpadBtn: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '8px',
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    cursor: 'pointer',
  },

  bottomBarContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '440px',
    padding: '0 16px 16px 16px',
    boxSizing: 'border-box',
    zIndex: 100,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 22, 24, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: theme.radius.full,
    border: `1px solid ${theme.colors.border}`,
    height: '64px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navTab: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: theme.colors.textSecondary,
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  navTabActive: { color: theme.colors.primary },
};

export const receiptStyles: { [key: string]: React.CSSProperties } = {
  ...commonStyles,

  mainTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '6px',
    backgroundColor: theme.colors.bgCard,
    padding: '4px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
  },
  mainTabBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 6px',
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainTabActive: {
    backgroundColor: theme.colors.bgElement,
    color: theme.colors.primary,
  },
  subSelector: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  subChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textSecondary,
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    justifyContent: 'center',
  },
  subChipActive: {
    backgroundColor: theme.colors.bgElement,
    color: theme.colors.textPrimary,
    borderColor: theme.colors.borderLight,
  },
  manualList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  manualRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: theme.colors.bgElement,
    border: 'none',
    borderRadius: theme.radius.md,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  addItemBtn: {
    backgroundColor: theme.colors.bgElement,
    border: `1px dashed ${theme.colors.borderLight}`,
    borderRadius: '14px',
    padding: '12px',
    color: theme.colors.primary,
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    marginTop: '4px',
  },
};

export const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    boxSizing: 'border-box',
  },
  content: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    border: `1px solid ${theme.colors.border}`,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
    maxHeight: '80vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  subGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    maxHeight: '50vh',
    overflowY: 'auto',
    paddingRight: '2px',
  },
  subItemBtn: {
    padding: '12px 8px',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElement,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subItemBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    color: theme.colors.primary,
  },
};

export const datePickerStyles: { [key: string]: React.CSSProperties | string } = {
  triggerBtn: {
    ...commonStyles.inputControl,
    justifyContent: 'flex-start',
    gap: '8px',
    width: '100%',
  },
  calendarIcon: {
    flexShrink: 0,
  },
  dateText: {
    color: theme.colors.textPrimary,
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  popupThemeCss: `
    /* Контейнер года */
    .react-datepicker-year-header,
    .react-datepicker__header .react-datepicker-year-header {
      color: #FFFFFF !important;
      font-weight: 700 !important;
      font-size: 15px !important;
    }

    /* На всякий случай перебиваем глубокие селекторы в шапке */
    .react-datepicker__header,
    .react-datepicker__header * {
      color: #FFFFFF !important;
    }

    .react-datepicker {
      background-color: ${theme.colors.bgCard} !important;
      border: 1px solid ${theme.colors.border} !important;
      border-radius: ${theme.radius.lg} !important;
      font-family: inherit !important;
      color: ${theme.colors.textPrimary} !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${theme.colors.primary} !important;
    }

    .react-datepicker__month-text,
    .react-datepicker__day {
      color: ${theme.colors.textPrimary} !important;
      border-radius: ${theme.radius.md} !important;
    }

    .react-datepicker__month-text:hover,
    .react-datepicker__day:hover {
      background-color: ${theme.colors.bgElement} !important;
    }

    .react-datepicker__month-text--selected,
    .react-datepicker__month-text--keyboard-selected,
    .react-datepicker__day--selected {
      background-color: ${theme.colors.primary} !important;
      color: #000000 !important;
      font-weight: 700 !important;
    }
  `,
};

export const statusModalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '16px',
    padding: '24px 36px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    minWidth: '180px',
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center' as const,
  },
};