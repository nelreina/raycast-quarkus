/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionPanel, open, List, Action, Icon, LaunchProps, LocalStorage, Toast, showToast, Clipboard } from "@raycast/api";

import { useEffect, useState } from "react";
import { useFetch } from "@raycast/utils"
import { generateUrl } from "./utils.js";
// node-fetch is a light-weight module that brings window.fetch to Node.js
import fetch from "node-fetch";
import { writeFile } from "fs/promises";



import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  name: string;
  bodyWeight?: string;
  bodyHeight?: string;
}
const host = "https://code.quarkus.io";

const removeDuplicatesIds = (result: any) => {
  const ids = new Set<string>((result)?.map((i: any) => i.id));
  const data: any[] = [];
  for (const id of ids) {
    const item = result.find((i: { id: string; }) => i.id === id);
    if (item) {
      data.push(item);
    }
  }
  // Sort data by name

  return {
    data: {
      items: data,
      map: (arg0: (i: any) => any) => null,
    },
  };
}


const getDependcyString = (extensionId: string) => {
  return `<dependency>
    <groupId>${extensionId.split(":")[0]}</groupId>
    <artifactId>${extensionId.split(":")[1]}</artifactId>
</dependency>`;
}

export default function Command(props: LaunchProps<{ arguments: Arguments.MyCommand }>) {
  const preferences = getPreferenceValues<Preferences>();
  const [selectedExtensionIds, setSelectedExtensionIds] = useState<string[]>([]);
  const [selectedExtensions, setSelectedExtensions] = useState<object[] | null>([]);
  const [data, setData] = useState<string | null>(null);
  const { isLoading, data: extensionList } = useFetch(host + "/api/extensions", { mapResult: removeDuplicatesIds },)

  const downloadProject = async () => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Download... ", message: "Your project is being downloaded." });
    let { artifactId } = props.arguments;
    let {directory} = preferences;
    if (!artifactId) {
      artifactId = "code-with-quarkus";
    }
    const ids = selectedExtensionIds.map((id) => id.split(":")[1]);
    const url = generateUrl(host, "/api/download", { ...preferences, artifactId }, ids);
    // fetch zip file to download
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      // Save zip file to disk
      const uint8Array = new Uint8Array(buffer);
      const filePath = `${directory}/${artifactId}.zip`; 
      const path = await writeFile(filePath, uint8Array);
      toast.style = Toast.Style.Success;
      toast.title = "Project Downloaded";
      
    } catch (error) {
      console.error(error);
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to Download Project";
      toast.message = error.message;      
    }
    // console.log(path);

    // console.log(url);
    // await open(url);
  };

  const saveExtensions = async () => {
    const options: Toast.Options = {
      style: Toast.Style.Success,
      title: "Extenstions Saved",
      message: "Selected extensions have been saved.",
    };
    await LocalStorage.setItem("selectedExtensions", JSON.stringify(selectedExtensions));
    await showToast(options);
  }

  const showExtensionGuide = async (url: string) => {
    console.log(url);
    await open(url);
  }

  const copyDependency = async (extensionId: string) => {
    await Clipboard.copy(getDependcyString(extensionId));

    await showToast({ style: Toast.Style.Success, title: "Copied pom.xml dependency to Clipboard" });
  }

  const clearSavedExtensions = async () => {
    await LocalStorage.removeItem("selectedExtensions");
    setSelectedExtensionIds([]);
    setSelectedExtensions([]);
    await showToast({ style: Toast.Style.Success, title: "Saved Extensions Cleared" });
  }

  useEffect(() => {
    setSelectedExtensions(selectedExtensionIds.map((id) => (extensionList.items as Array<any>).find((extension) => extension.id === id)));

  }, [selectedExtensionIds]);

  useEffect(() => {
    const getSavedExtensions = async () => {
      const savedExtensions = await LocalStorage.getItem("selectedExtensions");
      if (selectedExtensions) {
        const parsedExtensions = JSON.parse(savedExtensions || "[]");
        setSelectedExtensions(parsedExtensions);
        setSelectedExtensionIds(parsedExtensions.map((ext) => ext.id));
      }
    };
    getSavedExtensions();
  }, []);

  return (
    <>

      <List isLoading={isLoading} isShowingDetail onSelectionChange={setData} >
        <List.Section title={`Selected Quarkus Extensions (${selectedExtensions?.length}) `} >
          {selectedExtensions?.map((sext) => (
            <List.Item
              key={sext?.id}
              icon={Icon.Checkmark}
              title={sext?.name}
              detail={<ExtensionDetail extension={sext} />}
              actions={
                <ActionPanel>
                  <Action title="Remove" onAction={() => { setSelectedExtensionIds((s) => s.filter((x) => x !== sext?.id)) }} />
                  <Action title="Copy Dependency" onAction={() => copyDependency(sext?.id)} />
                  <Action title="Download Project" onAction={downloadProject} shortcut={{ modifiers: ["cmd"], key: "d" }} />
                  <Action title="See Extension Guide" onAction={() => showExtensionGuide(sext?.guide)} shortcut={{ modifiers: ["cmd"], key: "g" }} />
                  <Action title="Save Selected Extensions" onAction={saveExtensions} shortcut={{ modifiers: ["cmd"], key: "s" }} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>

        <List.Section title="Quarkus Extensions">
          {(extensionList?.items as Array<any> || [])?.map((extension) => (
            <List.Item
              key={extension?.id}
              id={extension?.id}
              icon="list-icon.png"
              title={extension?.name}
              detail={<ExtensionDetail extension={extension} />}
              actions={
                <ActionPanel>
                  <Action title="Select" onAction={() => { setSelectedExtensionIds(s => !s.includes(data) ? [...s, data || ""] : s) }} />
                  <Action title="Copy Dependency" onAction={() => copyDependency(extension?.id)} />
                  <Action title="Download Project" onAction={downloadProject} shortcut={{ modifiers: ["cmd"], key: "d" }} />
                  <Action title="See Extension Guide" onAction={() => showExtensionGuide(extension?.guide)} shortcut={{ modifiers: ["cmd"], key: "g" }} />
                  <Action title="Clear Saved Extensions" onAction={clearSavedExtensions} />
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
## ${extension?.name}  \n
> _${extension?.id}:${extension?.version}_ \n\n
${extension?.description} \n

\`\`\`xml
${getDependcyString(extension?.id)}
\`\`\`


`} />);
}