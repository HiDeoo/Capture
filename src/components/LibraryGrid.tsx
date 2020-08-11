import { observer } from 'mobx-react-lite'
import { stripUnit } from 'polished'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import type { HistoryEntry, SelectEntry } from '../store/history'
import Theme from '../utils/theme'
import Icon, { IconSymbol } from './Icon'
import Img from './Img'

/**
 * Various sizes defining the grid layout.
 */
const GridGap = stripUnit(Theme.library.gap)
const GridEntryHeight = stripUnit(Theme.library.size)
const GridEntryWidth = stripUnit(Theme.library.size)

const Deleted = styled.div`
  ${tw`border-2 border-solid flex justify-center items-center text-3xl`}

  background-color: ${theme('color.white3')};
  border-color: ${theme('library.border')};
  color: ${theme('color.gray')};
  height: 70px;
  outline: 1px solid ${theme('library.shadow')};
  width: 90px;
`

const Entry = styled.div<EntryProps>`
  ${tw`flex items-center justify-center items-center w-full`}

  padding: ${Theme.library.gap};

  & > img,
  & > ${Deleted} {
    ${(props) =>
      props.selected &&
      `
      border-color: ${theme('library.selected')(props)};
      outline-color: ${theme('library.selected')(props)};
    `}
  }
`

const StyledImg = styled(Img)`
  ${tw`block max-h-full max-w-full border-2 border-solid`}

  border-color: ${theme('library.border')};
  outline: 1px solid ${theme('library.shadow')};
`

/**
 * Returns the library grid column count & width.
 * @param  gridWidth - The library grid width.
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
 * Returns the library grid row count.
 * @param  columnCount - The library grid column count.
 * @param  numEntries - The number of entries in the library.
 * @return The row count.
 */
function getGridRowCount(columnCount: number, numEntries: number): number {
  return Math.ceil(numEntries / columnCount)
}

const LibraryGrid: React.FC<Props> = React.memo(({ ids, markAsDeletedOnDisk, selectedEntryId, selectEntry }) => {
  const getItemKey: ItemKeySelector = ({ columnCount, columnIndex, data, rowIndex }) => {
    const index = rowIndex * columnCount + columnIndex

    if (index > data.length - 1) {
      return `${rowIndex}-${columnIndex}`
    }

    const id = data[index]

    return `${id}-${columnIndex}`
  }

  return (
    <AutoSizer>
      {({ height, width }) => {
        const columnInfos = getGridColumnInfos(width)
        const rowCount = getGridRowCount(columnInfos.count, ids.length)

        return (
          <FixedSizeGrid
            width={width}
            height={height}
            itemData={ids}
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
                columnCount={columnInfos.count}
                selectedEntryId={selectedEntryId}
                markAsDeletedOnDisk={markAsDeletedOnDisk}
              />
            )}
          </FixedSizeGrid>
        )
      }}
    </AutoSizer>
  )
})

const LibraryGridEntry: React.FC<LibraryGridEntryProps> = observer(
  ({ columnCount, columnIndex, data, markAsDeletedOnDisk, rowIndex, selectedEntryId, selectEntry, style }) => {
    const { entries } = useHistory()

    const index = rowIndex * columnCount + columnIndex

    if (index > data.length - 1) {
      return null
    }

    const id = data[index]
    const entry = entries.byId[id]
    const selected = selectedEntryId === entry.id

    function onClick(): void {
      selectEntry(selected ? undefined : entry)
    }

    function onError(): void {
      markAsDeletedOnDisk(entry)
    }

    return (
      <Entry style={style} onClick={onClick} selected={selected}>
        {entry.deleted.disk ? (
          <Deleted>
            <Icon symbol={IconSymbol.ExclamationMarkCircle} />
          </Deleted>
        ) : (
          <StyledImg src={`file://${entry.path}`} onError={onError} />
        )}
      </Entry>
    )
  }
)

export default LibraryGrid

interface Props extends CommonProps {
  ids: string[]
}

interface LibraryGridEntryProps extends GridChildComponentProps, CommonProps {
  columnCount: number
  data: string[]
}

type ItemKeySelector = (params: {
  columnCount: number
  columnIndex: number
  data: string[]
  rowIndex: number
}) => React.Key

interface EntryProps {
  selected: boolean
}

interface CommonProps {
  markAsDeletedOnDisk: (entry: HistoryEntry) => void
  selectedEntryId: Optional<string>
  selectEntry: SelectEntry
}
