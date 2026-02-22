from alembic_utils.pg_function import PGFunction

trigger_set_updated_at = PGFunction(
    schema="public",
    signature="trigger_set_updated_at()",
    definition="""
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
)
