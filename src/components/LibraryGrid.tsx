import { stripUnit } from 'polished'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { HistoryEntry } from '../store/history'
import Theme from '../utils/theme'
import Img from './Img'

/**
 * Various sizes defining the grid layout.
 */
const GridGap = stripUnit(Theme.history.gap)
const GridEntryHeight = stripUnit(Theme.history.size)
const GridEntryWidth = stripUnit(Theme.history.size)

const Entry = styled.div<EntryProps>`
  ${tw`flex items-center justify-center items-center w-full`}

  padding: ${Theme.history.gap};

  & > img {
    ${(props) =>
      props.selected &&
      `
      border-color: ${theme('history.selected')(props)};
      outline-color: ${theme('history.selected')(props)};
    `}
  }
`

const StyledImg = styled(Img)`
  ${tw`block max-h-full max-w-full border-2 border-solid`}

  border-color: ${theme('history.border')};
  outline: 1px solid ${theme('history.shadow')};
`

/**
 * Returns the history grid column count & width.
 * @param  gridWidth - The history grid width.
 * @return The column count and size.
 */
function getGridColumnInfos(gridWidth: number): { count: number; width: number } {
  const count = Math.floor(gridWidth / (GridEntryWidth + GridGap))

  return {
    count,
    width: Math.floor(gridWidth / count),
  }
}

/**
 * Returns the history grid row count.
 * @param  columnCount - The history grid column count.
 * @param  numEntries - The number of entries in the history.
 * @return The row count.
 */
function getGridRowCount(columnCount: number, numEntries: number): number {
  return Math.ceil(numEntries / columnCount)
}

const LibraryGrid: React.FC<Props> = React.memo(({ entries, selectedEntry, selectEntry }) => {
  const getItemKey: ItemKeySelector = ({ columnCount, columnIndex, data, rowIndex }) => {
    const index = rowIndex * columnCount + columnIndex

    if (index > data.length - 1) {
      return `${rowIndex}-${columnIndex}`
    }

    const entry = data[index]

    return `${entry.id}-${columnIndex}`
  }

  return (
    <AutoSizer>
      {({ height, width }) => {
        const columnInfos = getGridColumnInfos(width)
        const rowCount = getGridRowCount(columnInfos.count, entries.length)

        return (
          <FixedSizeGrid
            width={width}
            height={height}
            itemData={entries}
            rowCount={rowCount}
            columnCount={columnInfos.count}
            columnWidth={columnInfos.width}
            rowHeight={GridEntryHeight + GridGap}
            itemKey={(infos) => getItemKey({ ...infos, columnCount: columnInfos.count })}
          >
            {({ columnIndex, data, rowIndex, style }) => (
              <LibraryGridEntry
                data={data}
                style={style}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                selectEntry={selectEntry}
                selectedEntry={selectedEntry}
                columnCount={columnInfos.count}
              />
            )}
          </FixedSizeGrid>
        )
      }}
    </AutoSizer>
  )
})

const LibraryGridEntry: React.FC<LibraryGridEntryProps> = React.memo(
  ({ columnCount, columnIndex, data, rowIndex, selectedEntry, selectEntry, style }) => {
    const index = rowIndex * columnCount + columnIndex

    if (index > data.length - 1) {
      return null
    }

    const entry = data[index]
    const selected = selectedEntry?.id === entry.id

    function onClick(): void {
      selectEntry(selected ? undefined : entry)
    }

    return (
      <Entry style={style} onClick={onClick} selected={selected}>
        <StyledImg src={`file://${entry.path}`} />
      </Entry>
    )
  }
)

export default LibraryGrid

interface Props {
  entries: HistoryEntry[]
  selectedEntry: Optional<HistoryEntry>
  selectEntry: (entry: Optional<HistoryEntry>) => void
}

interface LibraryGridEntryProps extends GridChildComponentProps {
  columnCount: number
  data: HistoryEntry[]
  selectedEntry: Optional<HistoryEntry>
  selectEntry: (entry: Optional<HistoryEntry>) => void
}

type ItemKeySelector = (params: {
  columnCount: number
  columnIndex: number
  data: HistoryEntry[]
  rowIndex: number
}) => React.Key

interface EntryProps {
  selected: boolean
}
