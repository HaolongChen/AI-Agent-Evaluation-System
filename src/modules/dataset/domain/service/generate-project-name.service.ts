export const generateProjectName = (
  goldenSetId: string,
  userInputId: string,
): string => {
  return `temp-project-${goldenSetId[0]}-${userInputId[0]}-${Date.now()}`;
};
