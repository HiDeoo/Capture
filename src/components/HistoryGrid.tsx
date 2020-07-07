import React from 'react'
import GridList, { GridListProps } from 'react-gridlist'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Img from './Img'
import { HistoryEntry } from '../store/history'
import { stripUnit } from '../utils/css'
import Theme from '../utils/theme'

/**
 * Various sizes defining the grid layout.
 */
const GridGap = stripUnit(Theme.history.gap)
const GridEntryHeight = stripUnit(Theme.history.height)
const GridEntryWidth = stripUnit(Theme.history.width)

/**
 * Entry component.
 */
const Entry = styled.div`
  ${tw`flex justify-center items-center w-full`}

  height: ${Theme.history.height};
`

/**
 * StyledImg component.
 */
const StyledImg = styled(Img)`
  ${tw`max-h-full max-w-full border-2 border-solid`}

  border-color: ${theme('history.border')};
  outline: 1px solid ${theme('history.shadow')};
`

/**
 * Returns the history grid gap between entries.
 * @return The history grid gap.
 */
function getHistoryGridGap(): number {
  return GridGap
}

/**
 * Returns the history grid column count.
 * @param  gridWidth - The history grid width.
 * @return The column count.
 */
function getHistoryGridColumnCount(gridWidth: number): number {
  return Math.floor(gridWidth / GridEntryWidth)
}

/**
 * Returns history grid entry data used to render each entries.
 * @param  entry - The history entry being rendered.
 * @return The data associated to each history grid entries.
 */
function getHistoryEntryRenderingData(entry: HistoryEntry): ReturnType<GridListProps<HistoryEntry>['getItemData']> {
  return {
    key: entry.path,
    height: GridEntryHeight,
  }
}

/**
 * Renders a history grid entry.
 * @param  entry - The entry to render.
 * @return The rendered history entry.
 */
function renderHistoryGridEntry(entry: HistoryEntry): React.ReactNode {
  return (
    <Entry>
      <StyledImg src={`file://${entry.path}`} />
    </Entry>
  )
}

/**
 * HistoryGridList Component.
 */
const HistoryGridList: React.FC<Props> = ({ entries }) => {
  return (
    <GridList
      items={entries}
      getGridGap={getHistoryGridGap}
      renderItem={renderHistoryGridEntry}
      getItemData={getHistoryEntryRenderingData}
      getColumnCount={getHistoryGridColumnCount}
    />
  )
}

export default HistoryGridList

/**
 * React Props.
 */
interface Props {
  entries: HistoryEntry[]
}
