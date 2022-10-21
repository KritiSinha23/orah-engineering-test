import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const ActivityPage: React.FC = () => {

  const [getActivities, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  const [activityData, setActivityData] = useState([])

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  useEffect(() => {
    setActivityData(data?.activity)
  }, [data])

  return <S.Container>
    <S.Heading>
      List of activity
    </S.Heading>

    {loadState === "loading" && (
      <CenteredContainer>
        <FontAwesomeIcon icon="spinner" size="2x" spin />
      </CenteredContainer>
    )}

    <CenteredContainer padding={" 15px 10px"}>
      <S.OrderedList>
        <>
          {loadState === "loaded" && activityData?.map(data => (
            <S.ListItem key={data.entity.id}>{`${data.entity.name} was completed on ${new Date(data.entity.completed_at).toString().split("G")[0]}`}</S.ListItem>
          ))}
        </>
      </S.OrderedList>
    </CenteredContainer>

    {loadState === "error" && (
      <CenteredContainer>
        <div>Failed to load</div>
      </CenteredContainer>
    )}
  </S.Container>
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
    background-color: white;
  `,
  Heading: styled.h3`
    text-align: center;
    font-weight: 600;
  `,
  OrderedList: styled.ol`
    display: block;
  `,
  ListItem: styled.li`
    padding: 25px;
    margin-bottom: 5px;
    display: flex;
    border-radius: 5px;
    background-color: #fdfbfb;
    box-shadow: 0 2px 7px rgb(5 66 145 / 13%);
    transition: box-shadow 0.3s ease-in-out;
    width: 87%;
  `
}
