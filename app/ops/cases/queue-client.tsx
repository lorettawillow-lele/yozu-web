"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TripCase } from "../../lib/ops";
import { stateLabels } from "../../lib/ops";
import { readStoredCases } from "../../lib/ops-storage";

type QueueClientProps = {
  seedCases: TripCase[];
};

export function CasesQueueClient({ seedCases }: QueueClientProps) {
  const [cases, setCases] = useState<TripCase[]>(seedCases);

  useEffect(() => {
    const stored = readStoredCases();
    if (stored.length) {
      setCases([...stored, ...seedCases]);
    }
  }, [seedCases]);

  return (
    <div className="tableShell">
      <div className="tableHeader tableRow">
        <span>Account / case</span>
        <span>Traveler</span>
        <span>State</span>
        <span>Owner</span>
        <span>Priority</span>
        <span>Next action</span>
      </div>
      {cases.map((item) => (
        <Link className="tableRow tableLink" key={item.id} href={`/ops/cases/${item.id}`}>
          <span>
            <strong>{item.id}</strong>
            <small>{item.company}</small>
          </span>
          <span>
            <strong>{item.traveler}</strong>
            <small>{item.destination}</small>
          </span>
          <span>
            <strong>{stateLabels[item.state]}</strong>
            <small>{item.tripPurpose}</small>
          </span>
          <span>{item.owner}</span>
          <span className={`priority priority-${item.priority}`}>{item.priority}</span>
          <span>{item.nextAction}</span>
        </Link>
      ))}
    </div>
  );
}
