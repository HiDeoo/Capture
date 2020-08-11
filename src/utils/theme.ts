/**
 * Common colors.
 */
const color = {
  black: '#000000',
  black1: '#0e0e0e',
  black2: '#2b282b',
  tint: '#2e91e8',
  white: '#ffffff',
  white1: '#dddddd',
  white2: '#cecfd1',
  gray: '#848385',
}

/**
 * Custom easing functions.
 * @see https://easings.net
 */
const easing = {
  easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

/**
 * Application theme.
 */
export default {
  color,
  easing,
  // Toolbars or nested sidebars.
  bar: {
    background: '#181718',
    border: color.black1,
    button: {
      active: {
        background: '#2d2b2e',
        color: color.tint,
      },
      background: '#252325',
      border: color.black1,
      color: color.white,
      hover: {
        background: '#2a282a',
        border: color.black,
        color: color.tint,
      },
    },
    color: {
      optionSize: '19px',
      size: '15px',
      transparentBackground: '#ff4e44',
    },
  },
  editor: {
    border: color.black,
  },
  library: {
    border: color.gray,
    gap: '10px',
    panel: {
      box: {
        border: '#565656',
        title: color.white1,
      },
      button: {
        color: color.white1,
        disabled: {
          color: '#737273',
        },
        hover: {
          color: color.tint,
        },
      },
      entry: {
        border: '#343434',
        label: '#999999',
      },
      preview: {
        border: color.gray,
        outline: color.black,
      },
    },
    selected: color.tint,
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
    blurred: {
      color: '#d2d1d3',
    },
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
      background: color.black2,
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
