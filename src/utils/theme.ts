const tintColor = '#2e91e8'

/**
 * Application theme.
 */
export default {
  colors: {
    tint: tintColor,
  },
  editor: {
    border: '#000000',
  },
  history: {
    border: '#848385',
    gap: '10px',
    height: '120px',
    shadow: '#0f0f11',
    width: '120px',
  },
  sideBar: {
    background: '#25242d',
    border: '#1f1e26',
    color: '#8d8a93',
    selected: {
      background: '#3d3b4b',
      color: tintColor,
    },
    width: '52px',
  },
  titleBar: {
    background: '#141314',
    border: '#000000',
    button: {
      background: '#2b282b',
      color: tintColor,
    },
    color: '#ffffff',
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
  toolbar: {
    background: '#181718',
    border: '#0e0e0e',
    button: {
      background: '#252325',
      border: '#0e0e0e',
      hover: {
        background: '#2a282a',
        border: '#000000',
        color: tintColor,
      },
    },
  },
  window: {
    background: '#1b1a1e',
  },
}
