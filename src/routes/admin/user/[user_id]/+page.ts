export function load({ params }: { params: { user_id: string } }) {
    return { userId: params.user_id };
}
