/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { useFetch } from "@raycast/utils"
import { generateUrl } from "./utils.js";

import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  name: string;
  bodyWeight?: string;
  bodyHeight?: string;
}


export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [selectedExtensionIds, setSelectedExtensionIds] = useState<string[]>([]);
  const [selectedExtensions, setSelectedExtensions] = useState<object[] | null>([]);
  const [data, setData] = useState<string | null>(null);
  const { isLoading, data: extensionList } = useFetch("https://code.quarkus.io/api/extensions", {},)
  const uniqueExtensionList: any[] = [];
  const extensionListIds = new Set((extensionList as Array<any>).map((extension) => extension.id));
  for (const ids of extensionListIds) {
    uniqueExtensionList.push((extensionList as Array<any>).find((extension) => extension.id === ids));
  }
  useEffect(() => {
    const ids = selectedExtensionIds.map((id) => id.split(":")[1]);
    console.log(JSON.stringify(ids));
    setSelectedExtensions(selectedExtensionIds.map((id) => (extensionList as Array<any>).find((extension) => extension.id === id)));
  }, [selectedExtensionIds]);

  return (
    <>
    
    <List isLoading={isLoading} isShowingDetail onSelectionChange={setData} >
      <List.Section title={`Selected Quarkus Extensions (${selectedExtensionIds.length}) `} >
      {selectedExtensions.map((sext) => (
        <List.Item
          key={sext.id}
          icon={Icon.Checkmark}
          title={sext.shortName || sext.name}
          detail={<ExtensionDetail extension={sext} />}
          actions={
            <ActionPanel>
              <Action title="Remove" onAction={() => { setSelectedExtensionIds((s) => s.filter((x) => x !== sext.id))  }} />
              <Action title="Generate" onAction={() => { 
                const url = generateUrl("", "/api/download", preferences);
                console.log(url);
             }} />
            </ActionPanel>
          }
        />
      ))}
      </List.Section>

      <List.Section title="Quarkus Extensions">
      {(uniqueExtensionList as Array<any> || [])?.map((extension) => (
        <List.Item
          key={extension.id}
          id={extension.id}
          icon="list-icon.png"
          title={extension.shortName || extension.name}
          detail={<ExtensionDetail extension={extension} />}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => { setSelectedExtensionIds(s => !s.includes(data) ?  [...s, data || ""] : s) }} />
            </ActionPanel>
          }
        />
      ))}
      </List.Section>
    </List>
    </>
  );
}

const ExtensionDetail: React.FC<{ extension: any }> = ({ extension }) => {
  return (
    <List.Item.Detail markdown={`
## ${extension.shortName || extension.name}  \n
> _${extension.id}:${extension.version}_ \n\n
${extension.description} \n
${JSON.stringify(extension, null, 2)} \n
`} />);}