import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

import { Select, MenuItem, colors, Input } from '@material-ui/core';
import { ArrowUp, ArrowDown } from '../../assets/images/icons';
import { RollInput } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveRoll, response, loading, error] = useApi<{}>({ url: "save-roll" })
  const [studentsData, setStudentsData] = useState(data?.students)
  const [copyOfStudentsData, setCopyOfStudentsData] = useState(data?.students)
  const [sortBy, setSortBy] = useState("first_name")
  const [ascOrderSort, setAscOrderSort] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [rollStateCount, setRollStateCount] = useState({
    "all": copyOfStudentsData?.length || 0,
    "present": 0,
    "late": 0,
    "absent": 0
  })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    let sortedData = ascOrderSort ? data?.students?.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1) : data?.students?.sort((a, b) => (a[sortBy] > b[sortBy]) ? -1 : 1)
    if (sortedData !== undefined) {
      setStudentsData([...sortedData])
      setCopyOfStudentsData([...sortedData])
    }
  }, [data, sortBy, ascOrderSort])

  useEffect(() => {
    let newRollStateCount = {
      "all": copyOfStudentsData?.length || 0,
      "present": 0,
      "late": 0,
      "absent": 0
    }
    copyOfStudentsData?.forEach((s) => {
      if (s.roll_state !== undefined) {
        newRollStateCount[s.roll_state] = newRollStateCount[s.roll_state] + 1
      }
    })
    setRollStateCount({ ...newRollStateCount })
  }, [copyOfStudentsData])

  useEffect(() => {
    if (searchText == "") {
      if (copyOfStudentsData !== undefined) {
        setStudentsData([...copyOfStudentsData])
      }
    } else {
      let filteredData = []
      filteredData = copyOfStudentsData?.filter(student => student.first_name.toLowerCase().includes(searchText.toLowerCase()) || student.last_name.toLowerCase().includes(searchText.toLowerCase()))
      setStudentsData([...filteredData])
    }
  }, [searchText])

  useEffect(() => {
    if (response) {
      if (response.success) {
        alert("Successfully saved roll")
      } else {
        alert("Error while saving roll")
      }
    }
  }, [response])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
      setRollStateCount({
        "all": copyOfStudentsData?.length || 0,
        "present": 0,
        "late": 0,
        "absent": 0
      })
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    } else if (action === "complete") {
      let student_roll_states: RollInput = []
      copyOfStudentsData?.forEach(student => {
        student_roll_states.push({
          student_id: student.id,
          roll_state: student.roll_state
        })
      })
      saveRoll(student_roll_states)
    } else if (action === "all") {
      setStudentsData([...copyOfStudentsData])
    } else {
      let filteredData = [];
      filteredData = copyOfStudentsData?.filter(student => student.roll_state === action)
      if (filteredData !== undefined) {
        setStudentsData([...filteredData])
      }
    }
  }

  const handleSortByChange = (event: object) => {
    setSortBy(event.target.value)
  }

  const handleArrowClick = () => {
    setAscOrderSort(!ascOrderSort)
  }

  const updateRollState = (id: number, rollType: string) => {
    copyOfStudentsData?.forEach((s) => {
      if (s.id == id) {
        s["roll_state"] = rollType
      }
    })
    if (copyOfStudentsData !== undefined) {
      setStudentsData([...copyOfStudentsData])
      setCopyOfStudentsData([...copyOfStudentsData])
    }
  }

  const searchByName = (text) => {
    setSearchText(text.target.value)
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} handleSortByChange={handleSortByChange} handleArrowClick={handleArrowClick} sortBy={sortBy} ascOrderSort={ascOrderSort} searchByName={searchByName} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {studentsData?.map((s) => (
              <StudentListTile key={s.id} studentId={s.id} isRollMode={isRollMode} student={s} rollState={updateRollState} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollStateCount={rollStateCount} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  handleSortByChange: (event: object) => void,
  handleArrowClick: () => void,
  searchByName: (value: string) => void
  sortBy: string,
  ascOrderSort: boolean
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, handleSortByChange, handleArrowClick, sortBy, ascOrderSort, searchByName } = props
  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>
        <Select style={{ color: "white", fontWeight: 600, fontSize: "14px" }} label={"Select sort by"} value={sortBy} onChange={handleSortByChange}>
          <MenuItem value={"first_name"}>First Name</MenuItem>
          <MenuItem value={"last_name"}>Last Name</MenuItem>
        </Select>
        <div style={{ display: "inline-block", position: "relative", top: "5px", cursor: "pointer" }} onClick={handleArrowClick}>
          {ascOrderSort ? <ArrowDown /> : <ArrowUp />}
        </div>
      </div>
      <div>
        <S.SearchInput type="text" placeholder="Search by name" onChange={searchByName} style={{}}></S.SearchInput>
      </div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SearchInput: styled.input`
    min-height: 24px;
    border-radius: 12px;
    border: none;
    padding-left: 8px;
  `
}
