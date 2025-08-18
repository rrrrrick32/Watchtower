// constants/tabs.js
import { BarChart3, Target, Shield, Activity } from 'lucide-react';

export const tabConfig = [
  {
    id: 'analysis',
    label: 'Analysis',
    icon: BarChart3
  },
  {
    id: 'pir',
    label: 'PIR',
    icon: Target
  },
  {
    id: 'ffir',
    label: 'FFIR',
    icon: Shield
  },
  {
    id: 'signalbridge',
    label: 'SignalBridge',
    icon: Activity
  }
];