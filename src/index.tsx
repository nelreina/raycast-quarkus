import { ActionPanel, Detail, List, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import { useFetch } from "@raycast/utils"

export default function Command() {
  // State to store selected extension ids
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  // State to store the data of the selected extension
  const [data, setData] = useState<string | null>(null);
  const { isLoading, data: extensionList } = useFetch("https://code.quarkus.io/api/extensions", {},)
  const uniqueExtensionList: any[] = [];
  // Create a set of extensionList ids
  const extensionListIds = new Set((extensionList as Array<any>).map((extension) => extension.id));
  for (const ids of extensionListIds) {
    uniqueExtensionList.push((extensionList as Array<any>).find((extension) => extension.id === ids));
  }
  useEffect(() => {
    // Print the selected extension ids
    console.log(selectedExtensions);
  }, [selectedExtensions]);

  return (
    <List isLoading={isLoading} isShowingDetail onSelectionChange={setData} >

      {(uniqueExtensionList as Array<any> || [])?.map((extension) => (
        <List.Item
          key={extension.id}
          id={extension.id}
          icon="list-icon.png"
          title={extension.shortName || extension.name}
          detail={<List.Item.Detail markdown={`## ${extension.shortName || extension.name} \n
_${extension.id}_ \n\n
> ${extension.description} \n
`} />}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => { setSelectedExtensions(s => [...s, data || ""]) }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
