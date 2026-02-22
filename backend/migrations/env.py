from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config, pool
from sqlalchemy.dialects import postgresql

from alembic import context
from alembic.operations import ops

from dotenv import load_dotenv

from models.all import Base, TimestampMixin
from models.all import functions  # your PGFunction list

from alembic_utils.replaceable_entity import register_entities

load_dotenv()

config = context.config
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ---------------------------
# ENUM rendering fix
# ---------------------------
def render_item(type_, obj, autogen_context):
    if type_ == "type" and isinstance(obj, postgresql.ENUM):
        autogen_context.imports.add("from sqlalchemy.dialects import postgresql")
        return (
            "postgresql.ENUM("
            + ", ".join(repr(e) for e in obj.enums)
            + f", name='{obj.name}', create_type=False)"
        )
    return False


# ---------------------------
# AUTO-INJECT TRIGGERS
# ---------------------------
def process_revision_directives(context, revision, directives):
    """
    Automatically append CREATE TRIGGER statements
    after CreateTableOp for models using TimestampMixin.
    """

    script = directives[0]

    upgrade_ops = script.upgrade_ops
    downgrade_ops = script.downgrade_ops

    for op_obj in list(upgrade_ops.ops):
        if isinstance(op_obj, ops.CreateTableOp):

            table_name = op_obj.table_name

            # Only if table has updated_at column
            if any(col.name == "updated_at" for col in op_obj.columns):

                upgrade_ops.ops.append(ops.ExecuteSQLOp(f"""
                        CREATE TRIGGER {table_name}_set_updated_at
                        BEFORE UPDATE ON public.{table_name}
                        FOR EACH ROW
                        EXECUTE FUNCTION public.trigger_set_updated_at();
                    """))

                downgrade_ops.ops.insert(
                    0,
                    ops.ExecuteSQLOp(f"""
                        DROP TRIGGER IF EXISTS {table_name}_set_updated_at
                        ON public.{table_name};
                        """),
                )


# ---------------------------
# Register ONLY functions
# ---------------------------
register_entities(functions)


# ---------------------------
# OFFLINE MODE
# ---------------------------
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        process_revision_directives=process_revision_directives,
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------
# ONLINE MODE
# ---------------------------
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            process_revision_directives=process_revision_directives,
            render_item=render_item,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
