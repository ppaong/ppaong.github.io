/**
 * 트랙(=강좌/시리즈) 정의. (PLAN 11장)
 *
 * 아직 트랙을 만들지 않았다. M2에서 첫 트랙과 샘플 글을 추가하며 아래 형식으로 채운다.
 *
 * @example
 * ```ts
 * export const TRACKS: Track[] = [
 *   {
 *     id: 'algorithms',
 *     title: '알고리즘',
 *     summary: '복잡도부터 그래프 탐색까지',
 *     difficulty: 2,
 *     status: 'planned',
 *   },
 * ];
 * ```
 */
export type TrackStatus = 'planned' | 'in-progress' | 'stable' | 'archived';

export interface Track {
  /** URL 세그먼트이자 불변 식별자. 영문 소문자/하이픈, 발행 후 변경 금지 */
  id: string;
  title: string;
  summary: string;
  /** 1~5 */
  difficulty: number;
  status: TrackStatus;
  /** (선택) 악센트 색. 트랙별 시각 구분에 사용 */
  color?: string;
}

export const TRACKS: Track[] = [];

/** 트랙 id → Track 조회 */
export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
