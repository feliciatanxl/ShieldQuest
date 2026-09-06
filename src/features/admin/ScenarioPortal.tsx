import { useState } from 'react';
import { FilePenLine, Plus, Archive, RotateCcw } from 'lucide-react';
import { demoScenarios } from '../../../types/demo';
import type { DistrictId, ScenarioStatus } from '../../../types';
import { Modal } from '../../components/Modal';
import { districts } from '../city-board/districts';

type Draft = { id: string; title: string; district: DistrictId; status: ScenarioStatus };
export function ScenarioPortal() {
  const [rows, setRows] = useState<Draft[]>(
    demoScenarios.map(({ id, title, district, status }) => ({ id, title, district, status })),
  );
  const [editing, setEditing] = useState<Draft | null>(null);
  return (
    <section className="surface padded">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FACILITATOR CORNER</span>
          <h2>Stories that start conversations.</h2>
        </div>
        <button
          className="primary-button"
          onClick={() =>
            setEditing({ id: crypto.randomUUID(), title: '', district: 'school', status: 'draft' })
          }
        >
          <Plus size={18} /> New draft
        </button>
      </div>
      <p>
        Try the scenario management interface. Changes stay in this screen; publishing here does not
        change the player’s board or any server data.
      </p>
      <div className="note">
        Portal preview · facilitator sign-in, review workflow and database publishing are not
        connected.
      </div>
      <div className="scenario-table">
        {rows.map((row) => (
          <div className="scenario-row" key={row.id}>
            <div className={`district-symbol ${row.district}`}>
              <FilePenLine size={22} />
            </div>
            <div className="row-title">
              <strong>{row.title}</strong>
              <span>{districts.find((district) => district.id === row.district)?.name}</span>
            </div>
            <span className="badge">{row.status}</span>
            <div className="row-actions">
              <button
                className="text-button"
                aria-label={`Edit ${row.title}`}
                onClick={() => setEditing({ ...row })}
              >
                Edit
              </button>
              <button
                className="icon-button"
                aria-label={`${row.status === 'archived' ? 'Restore' : 'Archive'} ${row.title}`}
                onClick={() =>
                  setRows(
                    rows.map((item) =>
                      item.id === row.id
                        ? { ...item, status: item.status === 'archived' ? 'draft' : 'archived' }
                        : item,
                    ),
                  )
                }
              >
                {row.status === 'archived' ? <RotateCcw size={17} /> : <Archive size={17} />}
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <Modal
          title={
            rows.some((row) => row.id === editing.id)
              ? 'Edit scenario preview'
              : 'New scenario preview'
          }
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!editing.title.trim()) return;
              setRows([
                ...rows.filter((row) => row.id !== editing.id),
                { ...editing, title: editing.title.trim() },
              ]);
              setEditing(null);
            }}
            className="editor-form"
          >
            <label>
              Scenario title
              <input
                value={editing.title}
                onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                required
                maxLength={100}
              />
            </label>
            <label>
              District
              <select
                value={editing.district}
                onChange={(event) =>
                  setEditing({ ...editing, district: event.target.value as DistrictId })
                }
              >
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preview status
              <select
                value={editing.status}
                onChange={(event) =>
                  setEditing({ ...editing, status: event.target.value as ScenarioStatus })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published (preview only)</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button className="primary-button full">Save local preview</button>
            <button
              className="text-button danger"
              type="button"
              onClick={() => {
                setRows(rows.filter((row) => row.id !== editing.id));
                setEditing(null);
              }}
            >
              Delete local preview
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
