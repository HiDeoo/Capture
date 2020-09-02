import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Icon, { IconSymbol } from './Icon'

const transitionName = 'dropOverlayAnimation'
const transitionEnterDuration = 350
const transitionExitDuration = 250

const Wrapper = styled.div`
  ${tw`fixed inset-0 flex justify-center items-center p-10`}

  background-color: ${theme('dropOverlay.background')};

  &.${transitionName}-enter {
    background-color: ${theme('dropOverlay.inactive.background')};
  }

  &.${transitionName}-enter-active {
    background-color: ${theme('dropOverlay.background')};
    transition: background-color ${transitionEnterDuration}ms ${theme('easing.easeOutCubic')};
  }

  &.${transitionName}-exit {
    background-color: ${theme('dropOverlay.background')};
  }

  &.${transitionName}-exit-active {
    background-color: ${theme('dropOverlay.inactive.background')};
    transition: background-color ${transitionExitDuration}ms ${theme('easing.easeInCubic')};
  }
`

const Border = styled.div`
  ${tw`h-full w-full flex justify-center items-center border-dashed border-4`}

  border-color: ${theme('dropOverlay.color')};
  border-radius: 0.7rem;

  .${transitionName}-enter & {
    border-color: ${theme('dropOverlay.inactive.color')};
  }

  .${transitionName}-enter-active & {
    border-color: ${theme('dropOverlay.color')};
    transition: border-color ${transitionEnterDuration}ms ${theme('easing.easeOutCubic')};
  }

  .${transitionName}-exit & {
    border-color: ${theme('dropOverlay.color')};
  }

  .${transitionName}-exit-active & {
    border-color: ${theme('dropOverlay.inactive.color')};
    transition: border-color ${transitionExitDuration}ms ${theme('easing.easeInCubic')};
  }
`

const Content = styled.div`
  color: ${theme('dropOverlay.color')};
  font-size: 8rem;

  .${transitionName}-enter & {
    opacity: 0;
    transform: translateY(-50vh) rotate(-10deg);
  }

  .${transitionName}-enter-active & {
    opacity: 1;
    transform: translateY(0);
    transition: all ${transitionEnterDuration}ms ${theme('easing.easeOutBack')};
    transition-property: opacity, transform;
  }

  .${transitionName}-exit & {
    opacity: 1;
    transform: translateY(0);
  }

  .${transitionName}-exit-active & {
    opacity: 0;
    transform: translateY(-50vh) rotate(-10deg);
    transition: all ${transitionExitDuration}ms ${theme('easing.easeInCubic')};
    transition-property: opacity, transform;
  }
`

const DropOverlay: React.FC<Props> = ({ active }) => {
  const nodeRef = useRef(null)

  return (
    <CSSTransition
      in={active}
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}
      classNames={transitionName}
      timeout={active ? transitionEnterDuration : transitionExitDuration}
    >
      <Wrapper ref={nodeRef}>
        <Border>
          <Content>
            <Icon symbol={IconSymbol.TrayAndArrowDownFill} />
            <div tw="text-sm -mt-4">Drag images to share them…</div>
          </Content>
        </Border>
      </Wrapper>
    </CSSTransition>
  )
}

export default DropOverlay

interface Props {
  active: boolean
}
