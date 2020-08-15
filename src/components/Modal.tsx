import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { useOnClickOutside, usePortal } from '../utils/react'
import Button, { ButtonProps } from './Button'

const transitionName = 'modalAnimation'
const transitionEnterDuration = 350
const transitionExitDuration = 250

const Wrapper = styled.div`
  ${tw`flex flex-col outline-none rounded overflow-hidden text-sm relative`}

  background-color: ${theme('modal.background')};
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.8);
  color: ${theme('modal.color')};
  max-height: 80vh;
  max-width: 70vw;
  min-width: 450px;
`

const Overlay = styled.div`
  ${tw`fixed inset-0 select-none flex justify-center items-center`}

  background-color: rgba(0, 0, 0, 0.4);

  &.${transitionName}-enter {
    ${tw`opacity-0`}

    & ${Wrapper} {
      transform: scale(0);
    }
  }

  &.${transitionName}-enter-active {
    ${tw`opacity-100`}

    transition: opacity ${transitionEnterDuration}ms ${theme('easing.easeOutCubic')};

    & ${Wrapper} {
      transform: scale(1);
      transition: transform ${transitionEnterDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  &.${transitionName}-exit {
    ${tw`opacity-100`}

    & ${Wrapper} {
      transform: scale(1);
    }
  }

  &.${transitionName}-exit-active {
    ${tw`opacity-0`}

    transition: opacity ${transitionExitDuration}ms ${theme('easing.easeInCubic')};

    & ${Wrapper} {
      transform: scale(0);
      transition: transform ${transitionExitDuration}ms ${theme('easing.easeInCubic')};
    }
  }
`

const Header = styled.div`
  ${tw`py-2 px-4 border-solid border-b text-base font-bold flex items-center`}

  border-color: ${theme('modal.border')};
  -webkit-app-region: drag;
`

const Content = styled.div`
  ${tw`overflow-auto py-3 px-4`}

  background-color: ${theme('modal.content')};

  & label input[type='checkbox'] {
    & + span {
      background-color: ${theme('modal.button.background')};
    }
  }

  & label:hover input[type='checkbox']:not(:disabled):not(:checked) {
    & + span {
      background-color: ${theme('modal.button.hover.background')};
    }
  }
`

const Footer = styled(Header)`
  ${tw`border-b-0 justify-end pt-1 pb-3`}

  background-color: ${theme('modal.content')};
  -webkit-app-region: no-drag;
`

export const ModalButton = styled(Button)<ModalButtonProps>`
  ${tw`border border-solid px-4 py-1 rounded mr-2 mb-1 text-sm font-medium`}

  background-color: ${ifProp('primary', theme('modal.button.primary.background'), theme('modal.button.background'))};
  border-color: ${theme('modal.button.border')};
  color: ${theme('modal.button.color')};

  &:hover:not(:disabled) {
    background-color: ${ifProp(
      'primary',
      theme('modal.button.primary.hover.background'),
      theme('modal.button.hover.background')
    )};
    color: ${ifProp('primary', theme('modal.button.primary.hover.color'), theme('modal.button.hover.color'))};
  }

  &:disabled {
    opacity: 0.6;
  }

  &:last-of-type {
    ${tw`mr-0`}
  }

  &:focus {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3)
  }
`

export function useModal(): ModalHook {
  const [opened, setOpened] = useState(false)
  const toggle: ModalHook['toggleModal'] = () => setOpened((prevOpened) => !prevOpened)

  return { isModalOpened: opened, openModal: setOpened, toggleModal: toggle }
}

const Modal: React.FC<ModalProps> = ({ buttons = [], children, closeButtonLabel, locked, open, opened, title }) => {
  const target = usePortal('modal')
  const overlay = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  useOnClickOutside(wrapper, () => {
    if (!locked) {
      open(false)
    }
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!opened) {
        return
      }

      if (event.key === 'Escape') {
        if (!locked) {
          open(false)
        }

        event.stopImmediatePropagation()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [locked, open, opened])

  function onClickCloseButton(): void {
    open(false)
  }

  return createPortal(
    <CSSTransition
      in={opened}
      mountOnEnter
      unmountOnExit
      nodeRef={overlay}
      classNames={transitionName}
      timeout={opened ? transitionEnterDuration : transitionExitDuration}
    >
      <Overlay ref={overlay}>
        <Wrapper ref={wrapper} tabIndex={-1} role="dialog">
          <Header>{title}</Header>
          <Content>{children}</Content>
          <Footer>
            <ModalButton
              disabled={locked}
              onClick={onClickCloseButton}
              primary={buttons.length === 0}
              autoFocus={buttons.length === 0}
            >
              {closeButtonLabel ?? 'Close'}
            </ModalButton>
            {React.Children.map(buttons, (button, index) => {
              const primary = index === buttons.length - 1

              if (isModalButton(button)) {
                return React.cloneElement(button, { autoFocus: primary, primary })
              }

              return null
            })}
          </Footer>
        </Wrapper>
      </Overlay>
    </CSSTransition>,
    target
  )
}

export default Modal

function isModalButton(element: {} | null | undefined): element is React.ReactElement<ModalButtonProps> {
  return React.isValidElement<ModalButtonProps>(element) && element.type === ModalButton
}

export interface ModalProps {
  buttons?: React.ReactNode[]
  closeButtonLabel?: string
  locked?: boolean
  open: React.Dispatch<React.SetStateAction<boolean>>
  opened: boolean
  title: string
}

interface ModalHook {
  isModalOpened: boolean
  openModal: React.Dispatch<React.SetStateAction<boolean>>
  toggleModal: () => void
}

interface ModalButtonProps extends ButtonProps {
  primary?: boolean
}
