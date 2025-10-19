export type copilotType =
    | 'dataModel'
    | 'uiBuilder'
    | 'actionflow'
    | 'logAnalyzer'
    | 'agentBuilder';

export type expectedAnswerType = 
    | 'yes'
    | 'no';

export type rubricContentType = {
    content: string[],
    rubricType: string[],
    category: string[],
    expectedAnswer: expectedAnswerType[]
}