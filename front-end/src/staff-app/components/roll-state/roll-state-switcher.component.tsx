import React, { useEffect, useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  studentId: number,
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void,
  rollStateFunc: () => void,
  rollMarkedAs: string
}
export const RollStateSwitcher: React.FC<Props> = ({ studentId, initialState = "unmark", size = 40, onStateChange, rollStateFunc, rollMarkedAs }) => {
  const [rollState, setRollState] = useState(initialState)

  useEffect(() => {
    if (rollMarkedAs !== undefined) {
      setRollState(rollMarkedAs)
    }
  }, [rollMarkedAs])

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    setRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
    rollStateFunc(studentId, next)
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
