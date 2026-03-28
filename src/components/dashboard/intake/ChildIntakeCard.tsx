'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Baby, Camera, Stethoscope, Trash2, UserRound } from 'lucide-react';
import { Badge, Button, Input, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChildPhotoUploader } from './ChildPhotoUploader';

export type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';

export interface IntakeEntry {
  localId: string;
  childId?: string;
  isExisting: boolean;
  includeInBatch: boolean;
  enroll: boolean;
  child: {
    firstName: string;
    lastName: string;
    preferredName: string;
    gender: string;
    pronouns: string;
    dateOfBirth: string;
    gradeLevel: string;
    schoolName: string;
    favoriteActivities: string;
    favoriteFoods: string;
    favoriteToys: string;
    comfortItems: string;
    temperamentNotes: string;
    learningStyle: string;
    napSchedule: string;
    languagePreferences: string;
    pottyTrainingStatus: string;
    childSsnLast4: string;
    childSsnLast4Masked: string | null;
    allergies: string;
    medicalNotes: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    photoStorageKey: string | null;
    photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
    photoSizeBytes: number | null;
    previewUrl: string | null;
  };
  enrollment: {
    programType: ProgramType;
    startDate: string;
    notes: string;
  };
}

interface ChildIntakeCardProps {
  entry: IntakeEntry;
  index: number;
  disabled?: boolean;
  canRemove: boolean;
  showSelectionControls?: boolean;
  showProfileFields?: boolean;
  showEnrollmentFields?: boolean;
  showReadinessBadges?: boolean;
  fullScreen?: boolean;
  onChange: (entry: IntakeEntry) => void;
  onRemove: (localId: string) => void;
}

function getAgeLabel(dateOfBirth: string) {
  if (!dateOfBirth) return 'Age will appear after DOB is entered';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 'Age unavailable';
  const now = new Date();
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) months -= 1;
  if (months < 0) return 'Age unavailable';
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years}y ${remMonths}m`;
}

function ProfilePack({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[10px] border border-slate-200/75 bg-white p-3', className)}>
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {description ? <p className="mt-0.5 text-xs text-ink-500">{description}</p> : null}
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

export function ChildIntakeCard({
  entry,
  index,
  disabled,
  canRemove,
  showSelectionControls = true,
  showProfileFields = true,
  showEnrollmentFields = true,
  showReadinessBadges = true,
  fullScreen = false,
  onChange,
  onRemove,
}: ChildIntakeCardProps) {
  const [profilePanel, setProfilePanel] = useState<'BASICS' | 'HEALTH' | 'ROUTINES' | 'LIKES'>('BASICS');
  const [basicsPack, setBasicsPack] = useState<'IDENTITY' | 'SCHOOL' | 'VERIFY'>('IDENTITY');
  const [healthPack, setHealthPack] = useState<'HEALTH' | 'EMERGENCY'>('HEALTH');
  const [routinePack, setRoutinePack] = useState<'LEARNING' | 'DAILY'>('LEARNING');
  const [likesPack, setLikesPack] = useState<'INTERESTS' | 'PHOTO'>('INTERESTS');

  useEffect(() => {
    setProfilePanel('BASICS');
    setBasicsPack('IDENTITY');
    setHealthPack('HEALTH');
    setRoutinePack('LEARNING');
    setLikesPack('INTERESTS');
  }, [entry.localId]);

  function updateChild<K extends keyof IntakeEntry['child']>(key: K, value: IntakeEntry['child'][K]) {
    onChange({
      ...entry,
      child: {
        ...entry.child,
        [key]: value,
      },
    });
  }

  function updateEnrollment<K extends keyof IntakeEntry['enrollment']>(
    key: K,
    value: IntakeEntry['enrollment'][K]
  ) {
    onChange({
      ...entry,
      enrollment: {
        ...entry.enrollment,
        [key]: value,
      },
    });
  }

  const childLabel = `${entry.child.firstName || 'Child'} ${entry.child.lastName || index + 1}`;
  const profileReady = Boolean(
    entry.child.firstName.trim() && entry.child.lastName.trim() && entry.child.dateOfBirth
  );
  const enrollmentReady = Boolean(entry.enrollment.programType && entry.enrollment.startDate);
  const cardSubtitle =
    showProfileFields && showEnrollmentFields
      ? 'Profile and enrollment details'
      : showProfileFields
        ? 'Profile and care details'
        : 'Enrollment details';

  const panelButtonClass = (active: boolean) =>
    cn(
      'rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
      active
        ? 'border-sky-300 bg-sky-100 text-sky-800 shadow-sm'
        : 'border-white/65 bg-white/80 text-ink-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
    );

  const packButtonClass = (active: boolean) =>
    cn(
      'rounded-[8px] border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] transition-all duration-200',
      active
        ? 'border-sky-300 bg-sky-100 text-sky-900'
        : 'border-line bg-white text-ink-600 hover:border-sky-200 hover:bg-sky-50'
    );

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[12px] border border-slate-200/80 bg-white/92 p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float sm:p-5',
        fullScreen && 'intake-v3-card'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
            <UserRound className="h-4 w-4" />
            {childLabel}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">{cardSubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.isExisting ? <Badge variant="info">Saved profile</Badge> : <Badge variant="success">New profile</Badge>}
          {showReadinessBadges && showProfileFields ? (
            <Badge variant={profileReady ? 'success' : 'warning'}>
              {profileReady ? 'Profile ready' : 'Profile incomplete'}
            </Badge>
          ) : null}
          {showReadinessBadges && showEnrollmentFields ? (
            <Badge variant={enrollmentReady ? 'success' : 'warning'}>
              {enrollmentReady ? 'Enrollment ready' : 'Enrollment incomplete'}
            </Badge>
          ) : null}
          {canRemove ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onRemove(entry.localId)}
              disabled={disabled}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {showSelectionControls ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            size="sm"
            variant={!entry.includeInBatch ? 'outline' : 'ghost'}
            onClick={() => onChange({ ...entry, includeInBatch: false, enroll: false })}
            disabled={disabled}
          >
            Skip
          </Button>
          <Button
            type="button"
            size="sm"
            variant={entry.includeInBatch && !entry.enroll ? 'primary' : 'outline'}
            onClick={() => onChange({ ...entry, includeInBatch: true, enroll: false })}
            disabled={disabled}
          >
            Profile Only
          </Button>
          <Button
            type="button"
            size="sm"
            variant={entry.includeInBatch && entry.enroll ? 'primary' : 'outline'}
            onClick={() => onChange({ ...entry, includeInBatch: true, enroll: true })}
            disabled={disabled}
          >
            Enroll
          </Button>
        </div>
      ) : null}

      {showProfileFields ? (
        <>
          <section className="mt-4 rounded-[10px] border border-slate-200/70 bg-white/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <UserRound className="h-4 w-4 text-sky-700" />
                Child details
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className={panelButtonClass(profilePanel === 'BASICS')}
                  onClick={() => setProfilePanel('BASICS')}
                  disabled={disabled}
                >
                  Basics
                </button>
                <button
                  type="button"
                  className={panelButtonClass(profilePanel === 'HEALTH')}
                  onClick={() => setProfilePanel('HEALTH')}
                  disabled={disabled}
                >
                  Health
                </button>
                <button
                  type="button"
                  className={panelButtonClass(profilePanel === 'ROUTINES')}
                  onClick={() => setProfilePanel('ROUTINES')}
                  disabled={disabled}
                >
                  Routines
                </button>
                <button
                  type="button"
                  className={panelButtonClass(profilePanel === 'LIKES')}
                  onClick={() => setProfilePanel('LIKES')}
                  disabled={disabled}
                >
                  Likes & Photo
                </button>
              </div>
            </div>

            {profilePanel === 'BASICS' ? (
              <div className="mt-2 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                <div className="lg:col-span-2 xl:col-span-3">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className={packButtonClass(basicsPack === 'IDENTITY')}
                      onClick={() => setBasicsPack('IDENTITY')}
                      disabled={disabled}
                    >
                      Identity Pack
                    </button>
                    <button
                      type="button"
                      className={packButtonClass(basicsPack === 'SCHOOL')}
                      onClick={() => setBasicsPack('SCHOOL')}
                      disabled={disabled}
                    >
                      School Pack
                    </button>
                    <button
                      type="button"
                      className={packButtonClass(basicsPack === 'VERIFY')}
                      onClick={() => setBasicsPack('VERIFY')}
                      disabled={disabled}
                    >
                      Verification Pack
                    </button>
                  </div>

                  {basicsPack === 'IDENTITY' ? (
                    <ProfilePack
                      title="Identity Pack"
                      description="Core legal and preferred identity details."
                    >
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <Input
                          label="First name"
                          value={entry.child.firstName}
                          onChange={(event) => updateChild('firstName', event.target.value)}
                          disabled={disabled}
                          required
                        />
                        <Input
                          label="Last name"
                          value={entry.child.lastName}
                          onChange={(event) => updateChild('lastName', event.target.value)}
                          disabled={disabled}
                          required
                        />
                        <Input
                          label="Preferred name"
                          value={entry.child.preferredName}
                          onChange={(event) => updateChild('preferredName', event.target.value)}
                          disabled={disabled}
                          placeholder="Nickname or preferred name"
                        />
                        <Input
                          label="Date of birth"
                          type="date"
                          value={entry.child.dateOfBirth}
                          onChange={(event) => updateChild('dateOfBirth', event.target.value)}
                          disabled={disabled}
                          required
                        />
                        <Input label="Age" value={getAgeLabel(entry.child.dateOfBirth)} disabled />
                      </div>
                    </ProfilePack>
                  ) : null}

                  {basicsPack === 'SCHOOL' ? (
                    <ProfilePack
                      title="School Pack"
                      description="School and classroom context."
                    >
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <Input
                          label="Grade level"
                          value={entry.child.gradeLevel}
                          onChange={(event) => updateChild('gradeLevel', event.target.value)}
                          disabled={disabled}
                          placeholder="Pre-K, Kindergarten, etc."
                        />
                        <Input
                          label="School name"
                          value={entry.child.schoolName}
                          onChange={(event) => updateChild('schoolName', event.target.value)}
                          disabled={disabled}
                        />
                        <Input
                          label="Gender"
                          value={entry.child.gender}
                          onChange={(event) => updateChild('gender', event.target.value)}
                          disabled={disabled}
                        />
                        <Input
                          label="Pronouns"
                          value={entry.child.pronouns}
                          onChange={(event) => updateChild('pronouns', event.target.value)}
                          disabled={disabled}
                          placeholder="They/Them, She/Her, etc."
                        />
                      </div>
                    </ProfilePack>
                  ) : null}

                  {basicsPack === 'VERIFY' ? (
                    <ProfilePack
                      title="Verification Pack"
                      description="Optional identity verification information."
                    >
                      <Input
                        label="Child SSN last4 (optional)"
                        inputMode="numeric"
                        maxLength={4}
                        value={entry.child.childSsnLast4}
                        onChange={(event) =>
                          updateChild('childSsnLast4', event.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        disabled={disabled}
                        placeholder="1234"
                      />
                      <p className="text-xs text-ink-500">
                        {entry.child.childSsnLast4Masked
                          ? `Stored value: ${entry.child.childSsnLast4Masked}. Enter 4 digits to replace it.`
                          : 'Used for enrollment verification when required.'}
                      </p>
                    </ProfilePack>
                  ) : null}
                </div>
              </div>
            ) : null}

            {profilePanel === 'HEALTH' ? (
              <div className="mt-2 grid gap-3 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className={packButtonClass(healthPack === 'HEALTH')}
                      onClick={() => setHealthPack('HEALTH')}
                      disabled={disabled}
                    >
                      Health Pack
                    </button>
                    <button
                      type="button"
                      className={packButtonClass(healthPack === 'EMERGENCY')}
                      onClick={() => setHealthPack('EMERGENCY')}
                      disabled={disabled}
                    >
                      Emergency Pack
                    </button>
                  </div>
                  {healthPack === 'HEALTH' ? (
                    <ProfilePack
                      title="Health Pack"
                      description="Medical and allergy details for the care team."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Allergies"
                          value={entry.child.allergies}
                          onChange={(event) => updateChild('allergies', event.target.value)}
                          disabled={disabled}
                          placeholder="Peanuts, dairy, etc."
                        />
                        <Textarea
                          label="Medical notes"
                          value={entry.child.medicalNotes}
                          onChange={(event) => updateChild('medicalNotes', event.target.value)}
                          disabled={disabled}
                          rows={4}
                          placeholder="Medication, care instructions, or medical details."
                        />
                      </div>
                    </ProfilePack>
                  ) : null}
                  {healthPack === 'EMERGENCY' ? (
                    <ProfilePack
                      title="Emergency Pack"
                      description="Primary emergency contact for this child."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Emergency contact"
                          value={entry.child.emergencyContactName}
                          onChange={(event) => updateChild('emergencyContactName', event.target.value)}
                          disabled={disabled}
                        />
                        <Input
                          label="Emergency phone"
                          value={entry.child.emergencyContactPhone}
                          onChange={(event) => updateChild('emergencyContactPhone', event.target.value)}
                          disabled={disabled}
                        />
                      </div>
                    </ProfilePack>
                  ) : null}
                </div>
              </div>
            ) : null}

            {profilePanel === 'ROUTINES' ? (
              <div className="mt-2 grid gap-3 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className={packButtonClass(routinePack === 'LEARNING')}
                      onClick={() => setRoutinePack('LEARNING')}
                      disabled={disabled}
                    >
                      Learning Pack
                    </button>
                    <button
                      type="button"
                      className={packButtonClass(routinePack === 'DAILY')}
                      onClick={() => setRoutinePack('DAILY')}
                      disabled={disabled}
                    >
                      Routine Pack
                    </button>
                  </div>
                  {routinePack === 'LEARNING' ? (
                    <ProfilePack
                      title="Learning Pack"
                      description="Classroom and learning preferences."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Learning style"
                          value={entry.child.learningStyle}
                          onChange={(event) => updateChild('learningStyle', event.target.value)}
                          disabled={disabled}
                          placeholder="Visual, hands-on, group, etc."
                        />
                        <Input
                          label="Language preferences"
                          value={entry.child.languagePreferences}
                          onChange={(event) => updateChild('languagePreferences', event.target.value)}
                          disabled={disabled}
                        />
                      </div>
                    </ProfilePack>
                  ) : null}
                  {routinePack === 'DAILY' ? (
                    <ProfilePack
                      title="Routine Pack"
                      description="Daily care routine details."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Nap schedule"
                          value={entry.child.napSchedule}
                          onChange={(event) => updateChild('napSchedule', event.target.value)}
                          disabled={disabled}
                          placeholder="Nap window, duration"
                        />
                        <Input
                          label="Potty training status"
                          value={entry.child.pottyTrainingStatus}
                          onChange={(event) => updateChild('pottyTrainingStatus', event.target.value)}
                          disabled={disabled}
                        />
                        <Textarea
                          label="Comfort items"
                          containerClassName="md:col-span-2"
                          value={entry.child.comfortItems}
                          onChange={(event) => updateChild('comfortItems', event.target.value)}
                          disabled={disabled}
                          rows={2}
                          placeholder="Blanket, toy, or preferred comfort routine."
                        />
                      </div>
                    </ProfilePack>
                  ) : null}
                </div>
              </div>
            ) : null}

            {profilePanel === 'LIKES' ? (
              <div className="mt-2 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="lg:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className={packButtonClass(likesPack === 'INTERESTS')}
                      onClick={() => setLikesPack('INTERESTS')}
                      disabled={disabled}
                    >
                      Interests Pack
                    </button>
                    <button
                      type="button"
                      className={packButtonClass(likesPack === 'PHOTO')}
                      onClick={() => setLikesPack('PHOTO')}
                      disabled={disabled}
                    >
                      Photo Pack
                    </button>
                  </div>

                  {likesPack === 'INTERESTS' ? (
                    <ProfilePack
                      title="Interests Pack"
                      description="Likes, preferences, and temperament."
                      className="border-slate-200/70"
                    >
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
                        <Stethoscope className="h-3.5 w-3.5 text-sky-700" />
                        Helps staff personalize care.
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Textarea
                          label="Favorite activities"
                          value={entry.child.favoriteActivities}
                          onChange={(event) => updateChild('favoriteActivities', event.target.value)}
                          disabled={disabled}
                          rows={2}
                        />
                        <Textarea
                          label="Favorite foods"
                          value={entry.child.favoriteFoods}
                          onChange={(event) => updateChild('favoriteFoods', event.target.value)}
                          disabled={disabled}
                          rows={2}
                        />
                        <Textarea
                          label="Favorite toys"
                          value={entry.child.favoriteToys}
                          onChange={(event) => updateChild('favoriteToys', event.target.value)}
                          disabled={disabled}
                          rows={2}
                        />
                        <Textarea
                          label="Temperament notes"
                          value={entry.child.temperamentNotes}
                          onChange={(event) => updateChild('temperamentNotes', event.target.value)}
                          disabled={disabled}
                          rows={3}
                          placeholder="Social style, comfort triggers, transition preferences."
                        />
                      </div>
                    </ProfilePack>
                  ) : null}
                  {likesPack === 'PHOTO' ? (
                    <ProfilePack
                      title="Photo Pack"
                      description="One photo (JPG/PNG/WebP, up to 5MB)."
                      className="border-sky-200 bg-white"
                    >
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
                        <Camera className="h-3.5 w-3.5 text-sky-700" />
                        Used for identification and classroom roster.
                      </div>
                      <ChildPhotoUploader
                        value={{
                          photoStorageKey: entry.child.photoStorageKey,
                          photoMimeType: entry.child.photoMimeType,
                          photoSizeBytes: entry.child.photoSizeBytes,
                          previewUrl: entry.child.previewUrl,
                        }}
                        disabled={disabled}
                        onChange={(photo) =>
                          onChange({
                            ...entry,
                            child: {
                              ...entry.child,
                              photoStorageKey: photo.photoStorageKey,
                              photoMimeType: photo.photoMimeType,
                              photoSizeBytes: photo.photoSizeBytes,
                              previewUrl: photo.previewUrl,
                            },
                          })
                        }
                      />
                    </ProfilePack>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {showEnrollmentFields ? (
        <section className="mt-4 rounded-[10px] border border-sky-300/80 bg-sky-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
            <Baby className="h-4 w-4" />
            Enrollment details
          </p>
          <p className="mt-1 text-xs text-sky-900/80">Choose a program and preferred start date to submit this request.</p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <Select
              label="Program"
              value={entry.enrollment.programType}
              onChange={(event) => updateEnrollment('programType', event.target.value as ProgramType)}
              disabled={disabled}
            >
              <option value="INFANT">Infant</option>
              <option value="TODDLER">Toddler</option>
              <option value="PRESCHOOL">Preschool</option>
              <option value="PRE_K">Pre-K</option>
            </Select>
            <Input
              label="Preferred start date"
              type="date"
              required
              value={entry.enrollment.startDate}
              onChange={(event) => updateEnrollment('startDate', event.target.value)}
              disabled={disabled}
            />
            <Textarea
              label="Notes for admissions"
              containerClassName="md:col-span-2"
              value={entry.enrollment.notes}
              onChange={(event) => updateEnrollment('notes', event.target.value)}
              disabled={disabled}
              rows={3}
              placeholder="Schedule constraints, support needs, or additional context."
            />
          </div>
        </section>
      ) : null}
    </article>
  );
}
