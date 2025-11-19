"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ActionIcon,
  Avatar,
  Button,
  Code,
  Group,
  Menu,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconHome2,
  IconBook,
  IconInfoCircle,
  IconMail,
  IconSun,
  IconMoon,
  IconLogout,
  IconUser,
  IconReceipt,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/context/AuthContext";
import classes from "./Navbar.module.css";

const navLinks = [
  { href: "/", label: "Home", icon: IconHome2 },
  { href: "/courses", label: "Courses", icon: IconBook },
  { href: "/about", label: "About", icon: IconInfoCircle },
  { href: "/contact", label: "Contact", icon: IconMail },
];

export default function Navbar() {
  console.log("✅ Navbar mounted");

  const { user, logout } = useAuth();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [active, setActive] = useState("/");
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    console.log("🟢 Color scheme loaded:", colorScheme);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== colorScheme) {
      console.log("🌗 Applying saved theme:", savedTheme);
      setColorScheme(savedTheme as "light" | "dark");
    }
  }, [setColorScheme, colorScheme]);

  useEffect(() => {
    console.log("👤 User object from AuthContext:", user);
  }, [user]);

  const toggleScheme = () => {
    const next = dark ? "light" : "dark";
    console.log("🌓 Theme toggled to:", next);
    setColorScheme(next);
    localStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    console.log("🚪 Logout clicked");
    try {
      await logout();
      notifications.show({
        title: "Logged out successfully 👋",
        message: "You have been signed out.",
        color: "green",
      });
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      notifications.show({
        title: "Logout failed ❌",
        message: "Please try again later.",
        color: "red",
      });
    }
  };

  const links = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => {
        console.log("🧭 Navigation clicked:", link.href);
        setActive(link.href);
      }}
      className={`${classes.link} ${active === link.href ? classes.active : ""}`}
    >
      <link.icon className={classes.linkIcon} stroke={1.6} />
      <span>{link.label}</span>
    </Link>
  ));

  return (
    <nav
      className={classes.navbar}
      style={{
        background: dark
          ? "linear-gradient(180deg, #1a1b1e, #2c2e33)"
          : "linear-gradient(180deg, #f8f9fa, #dee2e6)",
        color: dark ? "#fff" : "#111",
        transition: "all 0.3s ease",
        position: "relative",
        zIndex: 2000,
      }}
    >
      <div className={classes.navbarMain}>
        <Group justify="space-between" align="center" className={classes.header}>
          <Link href="/" onClick={() => console.log("🏠 Logo clicked")}>
            <Image
              src={dark ? "/logo-white.png" : "/logo-black.png"}
              alt="EduSpark Logo"
              width={260}
              height={120}
              priority
              style={{
                objectFit: "contain",
                cursor: "pointer",
                margin: "0 auto",
                display: "block",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1.0)")
              }
            />
          </Link>

          <Tooltip label="Toggle theme" position="right">
            <ActionIcon
              variant="light"
              color={dark ? "yellow" : "blue"}
              radius="xl"
              size="xl"
              onClick={toggleScheme}
              style={{ boxShadow: "var(--mantine-shadow-sm)" }}
            >
              {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        <div className={classes.linksContainer}>{links}</div>
      </div>

      {/* ✅ Footer / User Section */}
      <div className={classes.footer}>
        {user ? (
          <Menu
            shadow="md"
            width={220}
            position="top-end"
            withArrow
            withinPortal
            opened={menuOpened}
            onChange={(open) => {
              console.log("📂 Menu state changed:", open);
              setMenuOpened(open);
            }}
            onOpen={() => console.log("🔼 Menu opened")}
            onClose={() => console.log("🔽 Menu closed")}
          >
            <Menu.Target>
              <button
                onClick={() =>
                  console.log("👆 Avatar button clicked (Menu should open)")
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  pointerEvents: "auto",
                  zIndex: 3000,
                }}
              >
                <Avatar
                  src={user.photoURL || ""}
                  alt={user.displayName || "User"}
                  radius="xl"
                  size="md"
                >
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <span style={{ fontWeight: 500 }}>
                  {user.displayName || "User"}
                </span>
              </button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>My Account</Menu.Label>
              <Menu.Item
                component={Link}
                href="/profile"
                leftSection={<IconUser size={16} />}
                onClick={() => console.log("👤 Profile clicked")}
              >
                Profile
              </Menu.Item>

              <Menu.Item
                component={Link}
                href="/my-courses"
                leftSection={<IconBook size={16} />}
                onClick={() => console.log("📘 My Courses clicked")}
              >
                My Courses
              </Menu.Item>

              <Menu.Item
                component={Link}
                href="/transactions"
                leftSection={<IconReceipt size={16} />}
                onClick={() => console.log("💳 Transactions clicked")}
              >
                Transactions
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            component={Link}
            href="/login"
            color="blue"
            radius="xl"
            fullWidth
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="md"
            onClick={() => console.log("🔑 Login/Signup button clicked")}
          >
            Login / Signup
          </Button>
        )}

        <Code fw={700} className={classes.version}>
          v1.0
        </Code>
      </div>
    </nav>
  );
}