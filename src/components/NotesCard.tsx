"use client";

import { useState } from "react";
import { Card, Text, Group, Button, Badge, Stack } from "@mantine/core";
import { FileText, Lock, Download, Eye, ExternalLink } from "lucide-react";
import { notifications } from "@mantine/notifications";

interface NotesCardProps {
  note: {
    id: string;
    title: string;
    description?: string;
    fileUrl?: string;
    driveLink?: string;
    content?: string;
    type?: "pdf" | "doc" | "text" | "jpg";
  };
  hasAccess: boolean;
  index: number;
}

export default function NotesCard({ note, hasAccess, index }: NotesCardProps) {
  const [downloading, setDownloading] = useState(false);

  // Use fileUrl if available, otherwise fall back to driveLink
  const downloadUrl = note.fileUrl || note.driveLink;

  const handleDownload = async () => {
    if (!downloadUrl) {
      notifications.show({
        title: "No File Available",
        message: "This note doesn't have a downloadable file yet",
        color: "orange",
      });
      return;
    }

    setDownloading(true);

    try {
      // For Google Drive links, try direct download
      if (downloadUrl.includes("drive.google.com")) {
        // Convert to direct download if not already
        let directUrl = downloadUrl;
        
        if (!directUrl.includes("uc?export=download")) {
          const fileId = extractDriveFileId(downloadUrl);
          if (fileId) {
            directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          }
        }
        
        // Open in new tab for Google Drive (download will start automatically)
        window.open(directUrl, "_blank");
        
        notifications.show({
          title: "Download Started ✓",
          message: `Downloading ${note.title}`,
          color: "green",
        });
      } else {
        // For other URLs, try to fetch and download
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        let extension = downloadUrl.split(".").pop()?.split("?")[0];
        if (!extension || extension.length > 4) {
          extension = note.type || "pdf";
        }
        
        link.download = `${note.title}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        notifications.show({
          title: "Download Started ✓",
          message: `Downloading ${note.title}`,
          color: "green",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      notifications.show({
        title: "Download Failed",
        message: "Could not download the file. Opening in new tab instead...",
        color: "orange",
      });
      // Fallback: open in new tab
      window.open(downloadUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleView = () => {
    if (!downloadUrl) {
      notifications.show({
        title: "No File Available",
        message: "This note doesn't have a viewable file yet",
        color: "orange",
      });
      return;
    }
    
    // For Google Drive, convert to preview link
    if (downloadUrl.includes("drive.google.com")) {
      const fileId = extractDriveFileId(downloadUrl);
      if (fileId) {
        window.open(`https://drive.google.com/file/d/${fileId}/preview`, "_blank");
        return;
      }
    }
    
    window.open(downloadUrl, "_blank");
  };

  // Helper function to extract Google Drive file ID
  const extractDriveFileId = (url: string): string | null => {
    let fileId = null;
    
    if (url.includes("/file/d/")) {
      fileId = url.split("/file/d/")[1].split("/")[0];
    } else if (url.includes("open?id=")) {
      fileId = url.split("open?id=")[1].split("&")[0];
    } else if (url.includes("id=")) {
      fileId = url.split("id=")[1].split("&")[0];
    }
    
    return fileId;
  };

  if (!hasAccess) {
    return (
      <Card shadow="md" radius="lg" withBorder p="md">
        <Group>
          <Lock size={30} color="gray" />
          <div style={{ flex: 1 }}>
            <Text fw={500} lineClamp={1}>
              {index + 1}. {note.title}
            </Text>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {note.description || "No description"}
            </Text>
          </div>
        </Group>
        <Badge color="red" variant="light" mt="sm">
          Locked
        </Badge>
      </Card>
    );
  }

  return (
    <Card shadow="md" radius="lg" withBorder p="md">
      <Group align="flex-start" wrap="nowrap">
        <FileText size={30} color="purple" />
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text fw={500} lineClamp={1}>
            {index + 1}. {note.title}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {note.description || "No description"}
          </Text>
          
          <Group gap="xs" mt={2}>
            {note.type && (
              <Badge size="sm" variant="dot" color="purple">
                {note.type.toUpperCase()}
              </Badge>
            )}
            {downloadUrl && downloadUrl.includes("drive.google.com") && (
              <Badge size="sm" variant="light" color="blue">
                Google Drive
              </Badge>
            )}
            {!downloadUrl && (
              <Badge size="sm" variant="light" color="orange">
                No file attached
              </Badge>
            )}
          </Group>

          <Group gap="xs" mt="xs">
            <Button
              size="xs"
              variant="light"
              color="blue"
              leftSection={<Eye size={14} />}
              onClick={handleView}
              disabled={!downloadUrl}
            >
              View
            </Button>
            <Button
              size="xs"
              variant="filled"
              color="purple"
              leftSection={<Download size={14} />}
              onClick={handleDownload}
              loading={downloading}
              disabled={!downloadUrl}
            >
              Download
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}