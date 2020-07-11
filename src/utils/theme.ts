/**
 * Common colors.
 */
const color = {
  black: '#000000',
  black1: '#0e0e0e',
  tint: '#2e91e8',
  white: '#ffffff',
}

/**
 * Application theme.
 */
export default {
  color,
  // Toolbars or nested sidebars.
  bar: {
    background: '#181718',
    border: color.black1,
    button: {
      background: '#252325',
      border: color.black1,
      hover: {
        background: '#2a282a',
        border: color.black,
        color: color.tint,
      },
    },
  },
  editor: {
    border: color.black,
  },
  history: {
    border: '#848385',
    gap: '10px',
    shadow: '#0f0f11',
    size: '120px',
  },
  settings: {
    button: {
      background: '#2f2d34',
      border: color.black1,
      hover: {
        background: '#29272e',
        border: color.black,
        color: color.tint,
      },
    },
  },
  // Application sidebar.
  sideBar: {
    background: '#25242d',
    border: '#1f1e26',
    color: color.white,
    selected: {
      background: '#3d3b4b',
      color: color.tint,
    },
    width: '52px',
  },
  titleBar: {
    background: '#141314',
    border: color.black,
    button: {
      background: '#2b282b',
      color: color.tint,
    },
    color: color.white,
    control: {
      background: '#ef4f47',
      color: '#990001',
      size: '13px',
    },
    blurred: {
      background: '#161516',
      border: '#080808',
      color: '#e3e3e3',
      control: {
        background: '#3d3b3f',
      },
    },
  },
  window: {
    background: '#1b1a1e',
  },
}
