# Secret Hitler Backend Models

## Game Model

### Properties

1. id
2. initiator
3. playerList
  - type: array
  - initialValue: [Initiator]
4. gameState
  - type: object (Game State Model)
  - initialState: Initial game state


## Game State Model

### Properties

1. numberOfLiberals
  - type: integer
  - initialValue: 0
2. numberOfFascists
  - type: integer
  - initialValue: 0
3. numberOfLiberalPolicies
  - type: integer
  - initialValue: 0
4. numberOfFascistPolicies
  - type: integer
  - initialValue: 0
5. currentPresident
  - type: integer (index of playerList)
6. currentChancellor
  - type: integer (index of playerList)
7. hitler
  - type: integer (index of playerList)
8. electionFailCount
  - type: integer
  - initialValue: 0
9. turnCount
  - type: integer
  - initialValue: 0
10. vetoPowerUnlocked (toggle when numberOfFascistPolicies equals 5)
  - type: boolean
  - initialValue: false


## Player Model

### Properties

1. user
  - type: object (User Model)
2. faction
  - type: string
  - enum: 'fascist'/'liberal'
3. hitler
  - type: boolean
  - initialValue: false
4. president
  - type: boolean
  - initialValue: false
5. chancellor
  - type: boolean
  - initialValue: false
6. executed
  - type: boolean
  - initialValue: false



## User Model

### Properties

1. id
  - type: string
2. username
  - type: string
2. avatar
  - type: integer (array index)
3. numberOfGames
  - type: integer
  - inititialValue: 0
4. numberOfWins
  - type: integer
  - inititialValue: 0