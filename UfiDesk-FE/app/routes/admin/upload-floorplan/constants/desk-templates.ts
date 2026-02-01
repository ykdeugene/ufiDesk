import { Direction, DeskType } from "../types/deskiunfo.types";
import type { TemplateDesk } from "../types/floorplan.types";

export const deskTemplates: TemplateDesk[] = [
  {
    direction: Direction.Up,
    hasMonitor: true,
    type: DeskType.Regular,
    label: "Up",
  },
  {
    direction: Direction.Down,
    hasMonitor: true,
    type: DeskType.Regular,
    label: "Down",
  },
  {
    direction: Direction.Left,
    hasMonitor: true,
    type: DeskType.Regular,
    label: "Left",
  },
  {
    direction: Direction.Right,
    hasMonitor: true,
    type: DeskType.Regular,
    label: "Right",
  },
];

export const deskTemplatesNoMonitor: TemplateDesk[] = [
  {
    direction: Direction.Up,
    hasMonitor: false,
    type: DeskType.Regular,
    label: "Up",
  },
  {
    direction: Direction.Down,
    hasMonitor: false,
    type: DeskType.Regular,
    label: "Down",
  },
  {
    direction: Direction.Left,
    hasMonitor: false,
    type: DeskType.Regular,
    label: "Left",
  },
  {
    direction: Direction.Right,
    hasMonitor: false,
    type: DeskType.Regular,
    label: "Right",
  },
];

export const standingDeskTemplates: TemplateDesk[] = [
  {
    direction: Direction.Up,
    hasMonitor: true,
    type: DeskType.Standing,
    label: "Up",
  },
  {
    direction: Direction.Down,
    hasMonitor: true,
    type: DeskType.Standing,
    label: "Down",
  },
  {
    direction: Direction.Left,
    hasMonitor: true,
    type: DeskType.Standing,
    label: "Left",
  },
  {
    direction: Direction.Right,
    hasMonitor: true,
    type: DeskType.Standing,
    label: "Right",
  },
];

export const standingDeskTemplatesNoMonitor: TemplateDesk[] = [
  {
    direction: Direction.Up,
    hasMonitor: false,
    type: DeskType.Standing,
    label: "Up",
  },
  {
    direction: Direction.Down,
    hasMonitor: false,
    type: DeskType.Standing,
    label: "Down",
  },
  {
    direction: Direction.Left,
    hasMonitor: false,
    type: DeskType.Standing,
    label: "Left",
  },
  {
    direction: Direction.Right,
    hasMonitor: false,
    type: DeskType.Standing,
    label: "Right",
  },
];
