'use client';
import { PasswordFields } from '@/components/password-fields';

import { ImageUploader, SocialLinksFields, TwoColumnSections } from '@merqo/ui';

import { Section } from '@/components/section';
import { Button } from '@/components/ui/button';
import { useAsyncAction } from '@/hooks';
import { removeReplacedAvatar, uploadVendorAvatar } from '@/lib/image-upload-adapter';
import {
  displayNameSchema,
  passwordChangeSchema,
  profileNameSchema,
  socialLinksSchema,
  type SocialLinksInput,
} from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { FORM_ERROR_CLASS, FORM_LABEL_CLASS } from '@/lib/utils';
import { resizeToWebp } from '@merqo/ui';
import { Input, Label } from '@merqo/ui/primitives';
import { IdCard, KeyRound, Share2, Store, UserRound } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateSocialLinks, updateStallName } from './actions';

// Server bucket limit is 5MB; resizeToWebp re-encodes to WebP to stay under
// this, but the fallback path (decode/encode failure) uploads the original.
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MAX_DIM = 1000;

interface Props {
  vendorId: string;
  stallName: string;
  socialLinks: SocialLinksInput;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export function ProfileForm({
  vendorId,
  stallName,
  socialLinks,
  displayName,
  email,
  avatarUrl,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(stallName);
  const [nameError, setNameError] = useState<string | null>(null);
  const { pending: savingName, run: runName } = useAsyncAction();

  const [links, setLinks] = useState(socialLinks);
  const [linksError, setLinksError] = useState<string | null>(null);
  const { pending: savingLinks, run: runLinks } = useAsyncAction();

  const [avatar, setAvatar] = useState(avatarUrl);
  const { run: runAvatar } = useAsyncAction();

  const [display, setDisplay] = useState(displayName);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const { pending: savingDisplay, run: runDisplay } = useAsyncAction();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const { pending: savingPw, run: runPw } = useAsyncAction();

  function saveName() {
    const parsed = profileNameSchema.safeParse({ name });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? 'Enter a business name');
      return;
    }
    setNameError(null);
    return runName(async () => {
      try {
        const res = await updateStallName(parsed.data);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success('Business name saved');
        router.refresh();
      } catch {
        toast.error('Could not save business name. Try again.');
      }
    });
  }

  function saveLinks() {
    const parsed = socialLinksSchema.safeParse(links);
    if (!parsed.success) {
      setLinksError(parsed.error.issues[0]?.message ?? 'Invalid links');
      return;
    }
    setLinksError(null);
    return runLinks(async () => {
      try {
        const res = await updateSocialLinks(parsed.data);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success('Links saved');
      } catch {
        toast.error('Could not save links. Try again.');
      }
    });
  }

  function saveAvatar(url: string | null) {
    const previousAvatar = avatar;
    setAvatar(url);
    return runAvatar(async () => {
      try {
        const { error } = await supabase.auth.updateUser({ data: { avatar_url: url } });
        if (error) {
          // The upload landed but the save did not, so the new object is
          // referenced nowhere.
          if (url && url !== previousAvatar) void removeReplacedAvatar(url);
          setAvatar(previousAvatar);
          toast.error(error.message);
          return;
        }
        if (previousAvatar && previousAvatar !== url) void removeReplacedAvatar(previousAvatar);
        toast.success(url ? 'Profile icon saved' : 'Profile icon removed');
        router.refresh();
      } catch {
        setAvatar(previousAvatar);
        toast.error('Could not save profile icon. Try again.');
      }
    });
  }

  function saveDisplayName() {
    const parsed = displayNameSchema.safeParse({ displayName: display });
    if (!parsed.success) {
      setDisplayError(parsed.error.issues[0]?.message ?? 'Invalid name');
      return;
    }
    setDisplayError(null);
    return runDisplay(async () => {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { display_name: parsed.data.displayName },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Display name saved');
      } catch {
        toast.error('Could not save display name. Try again.');
      }
    });
  }

  function savePassword() {
    const parsed = passwordChangeSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      setPwError(parsed.error.issues[0]?.message ?? 'Check your password');
      return;
    }
    setPwError(null);
    return runPw(async () => {
      try {
        const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Password updated');
        setPassword('');
        setConfirm('');
      } catch {
        toast.error('Could not update password. Try again.');
      }
    });
  }

  return (
    <TwoColumnSections
      columnOne={
        <>
          <Section
            icon={<Store className="size-5" />}
            eyebrow="Shown to customers"
            title="Business name"
            description="The name vendors and Merqo kits see for your business."
          >
            <div className="space-y-2">
              <Label htmlFor="business-name" className={FORM_LABEL_CLASS}>
                Business name
              </Label>
              <Input
                id="business-name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'business-name-error' : undefined}
              />
              {nameError && (
                <p id="business-name-error" className={FORM_ERROR_CLASS}>
                  {nameError}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={saveName} disabled={savingName} aria-label="Save name">
                {savingName ? 'Saving…' : 'Save name'}
              </Button>
            </div>
          </Section>

          <Section
            icon={<UserRound className="size-5" />}
            eyebrow="Your account menu"
            title="Profile icon"
            description="A small image for your account menu. Defaults to your initials."
          >
            <div className="flex items-center gap-4">
              <ImageUploader
                bucket="vendor-avatars"
                pathPrefix={vendorId}
                value={avatar}
                onChange={saveAvatar}
                onUpload={uploadVendorAvatar}
                resizeImage={resizeToWebp}
                maxBytes={AVATAR_MAX_BYTES}
                maxDim={AVATAR_MAX_DIM}
                imageComponent={Image}
              />
              <p className="text-muted-foreground text-xs">
                Square images look best. Remove it any time to fall back to your initials badge.
              </p>
            </div>
          </Section>

          <Section
            icon={<KeyRound className="size-5" />}
            eyebrow="Sign-in security"
            title="Change password"
            description="Set a new password. At least 8 characters."
          >
            <div className="space-y-2">
              <Label htmlFor="account-email" className={FORM_LABEL_CLASS}>
                Email
              </Label>
              <Input
                id="account-email"
                value={email}
                readOnly
                disabled
                className="bg-secondary/60"
              />
              <p className="text-muted-foreground text-xs">
                Your sign-in email. It can&apos;t be changed here.
              </p>
            </div>
            <PasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
              error={pwError}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={savePassword}
                disabled={savingPw || !password || !confirm}
              >
                {savingPw ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </Section>
        </>
      }
      columnTwo={
        <>
          <Section
            icon={<IdCard className="size-5" />}
            eyebrow="Just for you"
            title="Display name"
            description="How stockkit addresses you. Customers never see this."
          >
            <div className="space-y-2">
              <Label htmlFor="display-name" className={FORM_LABEL_CLASS}>
                Display name
              </Label>
              <Input
                id="display-name"
                value={display}
                placeholder="e.g. Aisha"
                onChange={(e) => setDisplay(e.target.value)}
                aria-invalid={!!displayError}
                aria-describedby={displayError ? 'display-name-error' : undefined}
              />
              {displayError && (
                <p id="display-name-error" className={FORM_ERROR_CLASS}>
                  {displayError}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={saveDisplayName}
                disabled={savingDisplay}
                aria-label="Save display name"
              >
                {savingDisplay ? 'Saving…' : 'Save display name'}
              </Button>
            </div>
          </Section>

          <Section
            icon={<Share2 className="size-5" />}
            eyebrow="Shown to customers"
            title="Social links"
            description="Applies across every Merqo kit you use."
          >
            <SocialLinksFields value={links} onChange={setLinks} idPrefix="profile" />
            {linksError && <p className={FORM_ERROR_CLASS}>{linksError}</p>}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={saveLinks}
                disabled={savingLinks}
                aria-label="Save links"
              >
                {savingLinks ? 'Saving…' : 'Save links'}
              </Button>
            </div>
          </Section>
        </>
      }
    />
  );
}
