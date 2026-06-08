interface IProfileLike {
  url: string;
  username?: string;
}

const stripProtocol = (url: string): string => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const displayProfileText = (profile: IProfileLike): string => {
  const trimmed = profile.username?.trim();
  if (trimmed) return trimmed;
  return stripProtocol(profile.url);
};
