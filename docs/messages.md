## Message Communication between Secret Hitler Front and Back End

The following table documents all messages and their payloads sent from the front end to the back end. It also specfies the channel on which back end will respond.

| message to front end (equals game.message)                   | president (**chancellor*)                        | all                                                          | message from front end | payload to backend |
| ------------------------------------------------------------ | :----------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- | --------------- |
| **showRoles**                                                |                                                              | show each player his or her role ('ok' button + timer) | acknowledgePlayerRole           | gameId |
| **showFascists**                                             |                                                              | show **only fascists** all other fascists on the screen (timer, no 'ok' button to not reveal fascist identities to liberals) | acknowledgeFascists        | gameId |
| **showPresident**                                            |                                                              | show each player who current president ('ok' button + timer) | acknowledgePresident            | gameId |
| **suggestChancellor**                                        | show president all other players (clickable)                 |                                                              | suggestChancellor | gameId, playerId |
| **voteOnChancellor**                                         |                                                              | show each player suggested chancellor ('ja' + 'nein' buttons) | voteOnChancellor | gameId, playerId, vote ('ja'/'nein') |
| if (vote successful) **acknowledgeChancellor** | | show each player new chancellor ('ok' button + timer) | acknowledgeChancellor | gameId |
| if (vote unsuccessful) **showPresident** (i.e. begin new turn) |                                                              |                                                              |  |  |
| **showPresidentPolicyCards**                                 | show policy cards (clickable) and ask to pick 2 out of 3, 'ok' button ('ok' button to send off selection) |                                                              | pickPolicies | gameId, playerId, rejectedPolicy (array index 0, 1 or 2) |
| **showChancellorPolicyCards**                                | **show policy cards (clickable) and ask to pick 1 out of 2 ('ok' button to send off selection) |                                                              | pickPolicies | gameId, playerId, rejectedPolicy (array index 0 or 1) |
| **showPlayersChosenPolicy**                                  |                                                              | show chosen policy ('ok' button + timer) | acknowledgeChosenPolicy         | gameId |
| if (numberOfFascistPolicies = 4 or 5) **askPresidentToExecutePlayer** | show president all players and pick one to execute           |                                                              | executePlayer | gameId, playerId (to execute) |
| if (numberOfFascistPolicies = 5) **activateVetoPower** (not implemented as message, only toggle vetoPowerUnlocked on game) |                                                              | show all that veto power is activated (notification) | acknowledgeVetoPower            | gameId |
| **showChancellorPolicyCardsAndVetoButton** | **show chancellor two policies + veto button* |  | chancellorVetoPolicy | gameId, playerId |
| **letPresidentDecideVeto** | inform president that chancellor vetoed, ask to confirm or decline veto |  | presidentVetoPolicy | gameId, playerId, veto (true/false) |

### Comments

Future features may include

- handle vote fail count if majority votes 'nein' on suggested chancellor
- handle vote fail count if elected government vetos new policy